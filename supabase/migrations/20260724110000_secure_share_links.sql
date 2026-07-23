-- Secure share links: requires_auth, revoke RPC, auth-gated content RPCs.

alter table public.share_links
  add column if not exists requires_auth boolean not null default false;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.share_link_caller_authorized(p_link public.share_links)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    not coalesce(p_link.requires_auth, false)
    or public.current_clerk_user_id() <> '';
$$;

create or replace function public.screenshot_asset_readable_via_active_share(
  p_organization_id uuid,
  p_document_id text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.share_links sl
    where sl.organization_id = p_organization_id
      and sl.revoked_at is null
      and (sl.expires_at is null or sl.expires_at > now())
      and public.share_link_document_allowed(sl, p_document_id)
      and public.share_link_caller_authorized(sl)
  );
$$;

create or replace function public.storage_object_readable_via_active_share(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.screenshot_assets sa
    inner join public.share_links sl on sl.organization_id = sa.organization_id
    where sa.storage_path = p_name
      and sl.revoked_at is null
      and (sl.expires_at is null or sl.expires_at > now())
      and public.share_link_document_allowed(sl, sa.document_id)
      and public.share_link_caller_authorized(sl)
  );
$$;

-- ---------------------------------------------------------------------------
-- Resolve metadata (always returns requiresAuth; no content)
-- ---------------------------------------------------------------------------
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
    'channel', link.channel,
    'requiresAuth', coalesce(link.requires_auth, false),
    'expiresAt', link.expires_at,
    'settings', coalesce(link.settings, '{}'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Revoke + list
-- ---------------------------------------------------------------------------
create or replace function public.revoke_share_link(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  link public.share_links;
begin
  select * into link from public.share_links where id = p_id;
  if link.id is null then
    raise exception 'Share link not found';
  end if;

  if link.organization_id not in (select public.user_organization_ids()) then
    raise exception 'Not a member of this organization';
  end if;

  if not (
    public.is_org_admin(link.organization_id)
    or public.member_has_capability(link.organization_id, 'share')
    or public.member_has_capability(link.organization_id, 'embed')
  ) then
    raise exception 'Missing share or embed capability';
  end if;

  if link.revoked_at is not null then
    return true;
  end if;

  update public.share_links
  set revoked_at = now(), updated_at = now()
  where id = p_id;

  return true;
end;
$$;

create or replace function public.list_org_share_links_for_resource(
  p_resource_type text,
  p_resource_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.current_clerk_user_id() = '' then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', sl.id,
          'token', sl.token,
          'organizationId', sl.organization_id,
          'resourceType', sl.resource_type,
          'resourceId', sl.resource_id,
          'accessMode', sl.access_mode,
          'channel', sl.channel,
          'requiresAuth', coalesce(sl.requires_auth, false),
          'expiresAt', sl.expires_at,
          'revokedAt', sl.revoked_at,
          'createdBy', sl.created_by,
          'createdAt', sl.created_at,
          'updatedAt', sl.updated_at,
          'settings', coalesce(sl.settings, '{}'::jsonb)
        )
        order by sl.created_at desc
      )
      from public.share_links sl
      where sl.resource_type = p_resource_type
        and sl.resource_id = p_resource_id
        and sl.organization_id in (select public.user_organization_ids())
        and sl.revoked_at is null
    ),
    '[]'::jsonb
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Content RPCs — require signed-in Clerk user when requires_auth
-- ---------------------------------------------------------------------------
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

  if not public.share_link_caller_authorized(link) then
    return jsonb_build_object(
      'requiresAuth', true,
      'token', link.token
    );
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
    'createdBy', doc.created_by,
    'updatedBy', doc.updated_by,
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

  if not public.share_link_caller_authorized(link) then
    return jsonb_build_object(
      'requiresAuth', true,
      'token', link.token
    );
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
    'updatedAt', tour.updated_at,
    'createdBy', tour.created_by,
    'updatedBy', tour.updated_by
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

  if not public.share_link_caller_authorized(link) then
    return jsonb_build_object(
      'requiresAuth', true,
      'token', link.token
    );
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
    'updatedAt', persona.updated_at,
    'createdBy', persona.created_by,
    'updatedBy', persona.updated_by
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

  if not public.share_link_caller_authorized(link) then
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

grant execute on function public.resolve_share_link(text) to anon, authenticated;
grant execute on function public.get_shared_flow_document(text, text) to anon, authenticated;
grant execute on function public.get_shared_product_tour(text) to anon, authenticated;
grant execute on function public.get_shared_persona(text, text) to anon, authenticated;
grant execute on function public.list_shared_screenshot_assets(text, text) to anon, authenticated;
grant execute on function public.revoke_share_link(uuid) to authenticated;
grant execute on function public.list_org_share_links_for_resource(text, text) to authenticated;
grant execute on function public.share_link_caller_authorized(public.share_links) to anon, authenticated;
