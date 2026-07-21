-- Phase 4: product / share view analytics

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_type text not null check (
    event_type in (
      'share_view',
      'embed_view',
      'pdf_export',
      'document_view',
      'tour_view',
      'tour_complete',
      'share_link_created'
    )
  ),
  resource_type text,
  resource_id text,
  share_token text,
  referrer_domain text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_org_type_idx
  on public.analytics_events (organization_id, event_type);

create index if not exists analytics_events_share_token_idx
  on public.analytics_events (share_token);

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

-- Owners read only their own organization's analytics. All writes flow through
-- the security-definer RPCs below, so there are intentionally no insert policies.
create policy "analytics_events_select_own_org"
  on public.analytics_events for select
  to authenticated
  using (organization_id in (select public.user_organization_ids()));

-- Records a public share/embed view. Anon-safe: the caller only supplies a
-- share token; the organization + resource are derived from the active link so
-- clients can never forge attribution or write to arbitrary organizations.
create or replace function public.record_share_event(
  p_token text,
  p_event_type text,
  p_referrer_domain text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  link public.share_links;
begin
  if p_event_type not in ('share_view', 'embed_view') then
    raise exception 'invalid share event_type: %', p_event_type;
  end if;

  link := public.get_active_share_link(p_token);
  if link.id is null then
    return;
  end if;

  insert into public.analytics_events (
    organization_id,
    event_type,
    resource_type,
    resource_id,
    share_token,
    referrer_domain,
    metadata
  ) values (
    link.organization_id,
    p_event_type,
    link.resource_type,
    link.resource_id,
    link.token,
    left(coalesce(p_referrer_domain, ''), 255),
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

-- Records an authenticated, org-scoped product event (e.g. a PDF export). The
-- caller must belong to the target organization.
create or replace function public.record_org_event(
  p_organization_id uuid,
  p_event_type text,
  p_resource_type text default null,
  p_resource_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_organization_id not in (select public.user_organization_ids()) then
    raise exception 'not a member of organization %', p_organization_id;
  end if;

  if p_event_type not in (
    'pdf_export', 'document_view', 'tour_view', 'tour_complete', 'share_link_created'
  ) then
    raise exception 'invalid org event_type: %', p_event_type;
  end if;

  insert into public.analytics_events (
    organization_id,
    event_type,
    resource_type,
    resource_id,
    metadata
  ) values (
    p_organization_id,
    p_event_type,
    p_resource_type,
    p_resource_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

-- Aggregates the dashboard analytics for an organization over the last N days:
-- headline totals, a per-type breakdown, a daily views time series, and the top
-- referrer domains. Membership is enforced before any data is returned.
create or replace function public.get_org_analytics_summary(
  p_organization_id uuid,
  p_days int default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days int := greatest(coalesce(p_days, 30), 1);
  v_start timestamptz := date_trunc('day', now()) - make_interval(days => v_days - 1);
  v_view_types text[] := array['share_view', 'document_view', 'tour_view'];
  result jsonb;
begin
  if p_organization_id not in (select public.user_organization_ids()) then
    return null;
  end if;

  select jsonb_build_object(
    'totals', jsonb_build_object(
      'views', count(*) filter (where event_type = any (v_view_types)),
      'embedViews', count(*) filter (where event_type = 'embed_view'),
      'pdfExports', count(*) filter (where event_type = 'pdf_export')
    ),
    'byType', coalesce((
      select jsonb_agg(jsonb_build_object('eventType', t.event_type, 'count', t.c) order by t.c desc)
      from (
        select event_type, count(*) as c
        from public.analytics_events
        where organization_id = p_organization_id and created_at >= v_start
        group by event_type
      ) t
    ), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(
        jsonb_build_object('day', to_char(d.day, 'YYYY-MM-DD'), 'views', d.c) order by d.day
      )
      from (
        select gs::date as day,
          (
            select count(*)
            from public.analytics_events ae
            where ae.organization_id = p_organization_id
              and ae.event_type = any (v_view_types)
              and ae.created_at >= gs
              and ae.created_at < gs + interval '1 day'
          ) as c
        from generate_series(v_start, date_trunc('day', now()), interval '1 day') gs
      ) d
    ), '[]'::jsonb),
    'topReferrers', coalesce((
      select jsonb_agg(jsonb_build_object('referrerDomain', r.referrer_domain, 'count', r.c) order by r.c desc)
      from (
        select coalesce(nullif(referrer_domain, ''), 'direct') as referrer_domain, count(*) as c
        from public.analytics_events
        where organization_id = p_organization_id and created_at >= v_start
        group by 1
        order by c desc
        limit 5
      ) r
    ), '[]'::jsonb)
  )
  into result
  from public.analytics_events
  where organization_id = p_organization_id and created_at >= v_start;

  return coalesce(result, jsonb_build_object(
    'totals', jsonb_build_object('views', 0, 'embedViews', 0, 'pdfExports', 0),
    'byType', '[]'::jsonb,
    'daily', '[]'::jsonb,
    'topReferrers', '[]'::jsonb
  ));
end;
$$;

grant execute on function public.record_share_event(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.record_org_event(uuid, text, text, text, jsonb) to authenticated;
grant execute on function public.get_org_analytics_summary(uuid, int) to authenticated;
