-- Per-member contributor breakdowns for org admin overview:
-- docs / tours created, exports, and share links by actor.

create or replace function public.get_org_admin_activity(
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
  since timestamptz := now() - make_interval(days => greatest(p_days, 1));
begin
  if not public.is_org_admin(p_organization_id) then
    raise exception 'Admin access required';
  end if;

  return jsonb_build_object(
    'memberCount', (
      select count(*)::int from public.organization_members
      where organization_id = p_organization_id and status = 'active'
    ),
    'documentCount', (
      select count(*)::int from public.flow_documents
      where organization_id = p_organization_id
    ),
    'tourCount', (
      select count(*)::int from public.product_tours
      where organization_id = p_organization_id
    ),
    'exportCount', (
      select count(*)::int from public.analytics_events
      where organization_id = p_organization_id
        and created_at >= since
        and event_type in ('pdf_export', 'artifact_export')
    ),
    'shareCount', (
      select count(*)::int from public.analytics_events
      where organization_id = p_organization_id
        and created_at >= since
        and event_type = 'share_link_created'
    ),
    'byActor', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'email', actor_email,
            'displayName', coalesce(up.display_name, actor_email),
            'eventCount', event_count
          )
          order by event_count desc
        )
        from (
          select ae.actor_email, count(*)::int as event_count
          from public.analytics_events ae
          where ae.organization_id = p_organization_id
            and ae.created_at >= since
            and ae.actor_email is not null
          group by ae.actor_email
        ) counts
        left join public.user_profiles up on up.email = counts.actor_email
      ),
      '[]'::jsonb
    ),
    'docsByCreator', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'email', created_by,
            'displayName', coalesce(up.display_name, created_by),
            'count', doc_count
          )
          order by doc_count desc
        )
        from (
          select fd.created_by, count(*)::int as doc_count
          from public.flow_documents fd
          where fd.organization_id = p_organization_id
            and fd.created_by is not null
          group by fd.created_by
        ) docs
        left join public.user_profiles up on up.email = docs.created_by
      ),
      '[]'::jsonb
    ),
    'toursByCreator', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'email', created_by,
            'displayName', coalesce(up.display_name, created_by),
            'count', tour_count
          )
          order by tour_count desc
        )
        from (
          select pt.created_by, count(*)::int as tour_count
          from public.product_tours pt
          where pt.organization_id = p_organization_id
            and pt.created_by is not null
          group by pt.created_by
        ) tours
        left join public.user_profiles up on up.email = tours.created_by
      ),
      '[]'::jsonb
    ),
    'exportsByActor', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'email', actor_email,
            'displayName', coalesce(up.display_name, actor_email),
            'count', export_count
          )
          order by export_count desc
        )
        from (
          select ae.actor_email, count(*)::int as export_count
          from public.analytics_events ae
          where ae.organization_id = p_organization_id
            and ae.created_at >= since
            and ae.event_type in ('pdf_export', 'artifact_export')
            and ae.actor_email is not null
          group by ae.actor_email
        ) exports
        left join public.user_profiles up on up.email = exports.actor_email
      ),
      '[]'::jsonb
    ),
    'sharesByActor', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'email', actor_email,
            'displayName', coalesce(up.display_name, actor_email),
            'count', share_count
          )
          order by share_count desc
        )
        from (
          select ae.actor_email, count(*)::int as share_count
          from public.analytics_events ae
          where ae.organization_id = p_organization_id
            and ae.created_at >= since
            and ae.event_type = 'share_link_created'
            and ae.actor_email is not null
          group by ae.actor_email
        ) shares
        left join public.user_profiles up on up.email = shares.actor_email
      ),
      '[]'::jsonb
    )
  );
end;
$$;

grant execute on function public.get_org_admin_activity(uuid, int) to authenticated;
