-- Phase 3: public share links

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  resource_type text not null check (resource_type in ('document', 'tour')),
  resource_id text not null,
  access_mode text not null check (access_mode in ('readonly', 'editable')),
  settings jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists share_links_active_resource_uidx
  on public.share_links (organization_id, resource_type, resource_id, access_mode)
  where revoked_at is null;

create index if not exists share_links_token_active_idx
  on public.share_links (token)
  where revoked_at is null;

alter table public.share_links enable row level security;

create policy "share_links_all_own_org"
  on public.share_links for all
  to authenticated
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

create policy "share_links_select_active"
  on public.share_links for select
  to anon
  using (
    revoked_at is null
    and (expires_at is null or expires_at > now())
  );

create or replace function public.share_link_document_allowed(
  p_link public.share_links,
  p_document_id text
)
returns boolean
language sql
stable
as $$
  select case
    when p_link.resource_type = 'document' then p_link.resource_id = p_document_id
    when p_link.resource_type = 'tour' then exists (
      select 1
      from jsonb_array_elements_text(
        coalesce(p_link.settings -> 'allowedDocumentIds', '[]'::jsonb)
      ) as allowed(document_id)
      where allowed.document_id = p_document_id
    )
    else false
  end;
$$;

create or replace function public.get_active_share_link(p_token text)
returns public.share_links
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.share_links
  where token = p_token
    and revoked_at is null
    and (expires_at is null or expires_at > now())
  limit 1;
$$;

create or replace function public.resolve_share_link(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'token', link.token,
    'organizationId', link.organization_id,
    'resourceType', link.resource_type,
    'resourceId', link.resource_id,
    'accessMode', link.access_mode,
    'settings', coalesce(link.settings, '{}'::jsonb)
  );
end;
$$;

create or replace function public.get_shared_flow_document(
  p_token text,
  p_document_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
  doc public.flow_documents%rowtype;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null then
    return null;
  end if;

  if not public.share_link_document_allowed(link, p_document_id) then
    return null;
  end if;

  select *
  into doc
  from public.flow_documents
  where id = p_document_id
    and organization_id = link.organization_id;

  if doc.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', doc.id,
    'savedAt', doc.saved_at,
    'updatedAt', doc.updated_at,
    'flow', doc.flow,
    'steps', doc.steps,
    'shareSettings', doc.share_settings
  );
end;
$$;

create or replace function public.get_shared_product_tour(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
  tour public.product_tours%rowtype;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null or link.resource_type <> 'tour' then
    return null;
  end if;

  select *
  into tour
  from public.product_tours
  where id = link.resource_id
    and organization_id = link.organization_id;

  if tour.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', tour.id,
    'title', tour.title,
    'description', tour.description,
    'status', tour.status,
    'personaId', tour.persona_id,
    'tourGoal', tour.tour_goal,
    'features', tour.features,
    'completionCta', tour.completion_cta,
    'migratedFromRoute', tour.migrated_from_route,
    'createdAt', tour.created_at,
    'updatedAt', tour.updated_at
  );
end;
$$;

create or replace function public.get_shared_persona(
  p_token text,
  p_persona_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
  persona public.personas%rowtype;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null then
    return null;
  end if;

  select *
  into persona
  from public.personas
  where id = p_persona_id
    and organization_id = link.organization_id;

  if persona.id is null then
    return null;
  end if;

  if link.resource_type = 'tour' then
    if not exists (
      select 1
      from public.product_tours pt
      where pt.id = link.resource_id
        and pt.organization_id = link.organization_id
        and pt.persona_id = persona.id
    ) then
      return null;
    end if;
  else
    return null;
  end if;

  return jsonb_build_object(
    'id', persona.id,
    'name', persona.name,
    'occupation', persona.occupation,
    'age', persona.age,
    'shortBio', persona.short_bio,
    'defaultGoal', persona.default_goal,
    'gender', persona.gender,
    'avatarId', persona.avatar_id,
    'company', persona.company,
    'createdAt', persona.created_at,
    'updatedAt', persona.updated_at
  );
end;
$$;

create or replace function public.list_shared_screenshot_assets(
  p_token text,
  p_document_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null then
    return '[]'::jsonb;
  end if;

  if not public.share_link_document_allowed(link, p_document_id) then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', sa.id,
          'storagePath', sa.storage_path
        )
        order by sa.created_at
      )
      from public.screenshot_assets sa
      where sa.organization_id = link.organization_id
        and sa.document_id = p_document_id
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.verify_editable_share_link(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
  clerk_id text;
begin
  clerk_id := public.current_clerk_user_id();
  if clerk_id = '' then
    return null;
  end if;

  link := public.get_active_share_link(p_token);
  if link.id is null or link.access_mode <> 'editable' then
    return null;
  end if;

  if not exists (
    select 1
    from public.organizations o
    where o.id = link.organization_id
      and o.clerk_user_id = clerk_id
  ) then
    return null;
  end if;

  return jsonb_build_object(
    'resourceType', link.resource_type,
    'resourceId', link.resource_id,
    'organizationId', link.organization_id
  );
end;
$$;

grant execute on function public.resolve_share_link(text) to anon, authenticated;
grant execute on function public.get_shared_flow_document(text, text) to anon, authenticated;
grant execute on function public.get_shared_product_tour(text) to anon, authenticated;
grant execute on function public.get_shared_persona(text, text) to anon, authenticated;
grant execute on function public.list_shared_screenshot_assets(text, text) to anon, authenticated;
grant execute on function public.verify_editable_share_link(text) to authenticated;

create policy "screenshot_assets_select_via_share"
  on public.screenshot_assets for select
  to anon
  using (
    exists (
      select 1
      from public.share_links sl
      where sl.organization_id = screenshot_assets.organization_id
        and sl.revoked_at is null
        and (sl.expires_at is null or sl.expires_at > now())
        and public.share_link_document_allowed(sl, screenshot_assets.document_id)
    )
  );

create policy "screenshots_anon_share_read"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'screenshots'
    and exists (
      select 1
      from public.screenshot_assets sa
      inner join public.share_links sl on sl.organization_id = sa.organization_id
      where sa.storage_path = storage.objects.name
        and sl.revoked_at is null
        and (sl.expires_at is null or sl.expires_at > now())
        and public.share_link_document_allowed(sl, sa.document_id)
    )
  );
