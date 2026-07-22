-- Multi-tenant organizations: memberships, invitations, membership-based RLS

-- ---------------------------------------------------------------------------
-- Capability defaults
-- ---------------------------------------------------------------------------
create or replace function public.default_admin_capabilities()
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'create', true,
    'edit', true,
    'delete', true,
    'share', true,
    'export', true,
    'embed', true
  );
$$;

create or replace function public.default_member_capabilities()
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'create', true,
    'edit', true,
    'delete', false,
    'share', true,
    'export', true,
    'embed', false
  );
$$;

-- ---------------------------------------------------------------------------
-- Evolve organizations
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists workspace_type text,
  add column if not exists website text,
  add column if not exists owner_clerk_user_id text;

update public.organizations
set
  workspace_type = coalesce(workspace_type, 'personal'),
  owner_clerk_user_id = coalesce(owner_clerk_user_id, clerk_user_id)
where true;

alter table public.organizations
  alter column workspace_type set default 'personal',
  alter column workspace_type set not null,
  alter column owner_clerk_user_id set not null;

alter table public.organizations
  drop constraint if exists organizations_workspace_type_check;

alter table public.organizations
  add constraint organizations_workspace_type_check
  check (workspace_type in ('personal', 'team'));

-- Drop unique on clerk_user_id (owner may own multiple orgs; members join others)
alter table public.organizations
  drop constraint if exists organizations_clerk_user_id_key;

-- Keep clerk_user_id populated for legacy reads; prefer owner_clerk_user_id going forward
create index if not exists organizations_owner_clerk_user_id_idx
  on public.organizations (owner_clerk_user_id);

-- ---------------------------------------------------------------------------
-- organization_members
-- ---------------------------------------------------------------------------
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  clerk_user_id text not null,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  capabilities jsonb not null default public.default_member_capabilities(),
  status text not null default 'active' check (status in ('active', 'disabled')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, clerk_user_id),
  unique (organization_id, email),
  constraint organization_members_email_lower check (email = lower(email))
);

create index if not exists organization_members_clerk_user_id_idx
  on public.organization_members (clerk_user_id);

create index if not exists organization_members_email_idx
  on public.organization_members (email);

-- ---------------------------------------------------------------------------
-- organization_invitations
-- ---------------------------------------------------------------------------
create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  capabilities jsonb not null default public.default_member_capabilities(),
  token text not null unique,
  invited_by_email text,
  invited_by_clerk_user_id text,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  resent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_invitations_email_lower check (email = lower(email))
);

create index if not exists organization_invitations_email_pending_idx
  on public.organization_invitations (email)
  where accepted_at is null and revoked_at is null;

create index if not exists organization_invitations_org_idx
  on public.organization_invitations (organization_id);

-- ---------------------------------------------------------------------------
-- Backfill: existing personal org owners become admin members
-- ---------------------------------------------------------------------------
insert into public.organization_members (
  organization_id,
  clerk_user_id,
  email,
  role,
  capabilities,
  status,
  joined_at
)
select
  o.id,
  o.owner_clerk_user_id,
  lower(coalesce(nullif(o.owner_email, ''), nullif(up.email, ''), o.owner_clerk_user_id || '@unknown.local')),
  'admin',
  public.default_admin_capabilities(),
  'active',
  coalesce(o.created_at, now())
from public.organizations o
left join public.user_profiles up on up.clerk_user_id = o.owner_clerk_user_id
on conflict (organization_id, clerk_user_id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.user_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_members
  where clerk_user_id = public.current_clerk_user_id()
    and status = 'active';
$$;

create or replace function public.is_org_admin(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_organization_id
      and m.clerk_user_id = public.current_clerk_user_id()
      and m.status = 'active'
      and m.role = 'admin'
  );
$$;

create or replace function public.member_has_capability(
  p_organization_id uuid,
  p_capability text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_organization_id
      and m.clerk_user_id = public.current_clerk_user_id()
      and m.status = 'active'
      and coalesce((m.capabilities ->> p_capability)::boolean, false) = true
  );
$$;

-- ---------------------------------------------------------------------------
-- Organizations policies (membership-based)
-- ---------------------------------------------------------------------------
drop policy if exists "organizations_select_own" on public.organizations;
drop policy if exists "organizations_insert_own" on public.organizations;
drop policy if exists "organizations_update_own" on public.organizations;

create policy "organizations_select_member"
  on public.organizations for select
  using (id in (select public.user_organization_ids()));

create policy "organizations_insert_owner"
  on public.organizations for insert
  with check (owner_clerk_user_id = public.current_clerk_user_id());

create policy "organizations_update_admin"
  on public.organizations for update
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

-- ---------------------------------------------------------------------------
-- Members / invitations RLS
-- ---------------------------------------------------------------------------
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;

create policy "organization_members_select_own_orgs"
  on public.organization_members for select
  using (
    organization_id in (select public.user_organization_ids())
    or clerk_user_id = public.current_clerk_user_id()
  );

create policy "organization_members_insert_admin"
  on public.organization_members for insert
  with check (
    public.is_org_admin(organization_id)
    or (
      -- Bootstrap: creator inserting themselves as first admin on a new org
      clerk_user_id = public.current_clerk_user_id()
      and role = 'admin'
      and exists (
        select 1 from public.organizations o
        where o.id = organization_id
          and o.owner_clerk_user_id = public.current_clerk_user_id()
      )
    )
  );

create policy "organization_members_update_admin"
  on public.organization_members for update
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "organization_members_delete_admin"
  on public.organization_members for delete
  using (public.is_org_admin(organization_id));

create policy "organization_invitations_select"
  on public.organization_invitations for select
  using (
    public.is_org_admin(organization_id)
    or (
      email = lower(coalesce(public.current_user_email(), ''))
      and accepted_at is null
      and revoked_at is null
    )
  );

create policy "organization_invitations_insert_admin"
  on public.organization_invitations for insert
  with check (public.is_org_admin(organization_id));

create policy "organization_invitations_update_admin"
  on public.organization_invitations for update
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "organization_invitations_delete_admin"
  on public.organization_invitations for delete
  using (public.is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- Storage policies → membership-based
-- ---------------------------------------------------------------------------
drop policy if exists "screenshots_select_own_org" on storage.objects;
drop policy if exists "screenshots_insert_own_org" on storage.objects;
drop policy if exists "screenshots_update_own_org" on storage.objects;
drop policy if exists "screenshots_delete_own_org" on storage.objects;

create policy "screenshots_select_own_org"
  on storage.objects for select
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where id in (select public.user_organization_ids())
    )
  );

create policy "screenshots_insert_own_org"
  on storage.objects for insert
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where id in (select public.user_organization_ids())
    )
  );

create policy "screenshots_update_own_org"
  on storage.objects for update
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where id in (select public.user_organization_ids())
    )
  )
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where id in (select public.user_organization_ids())
    )
  );

create policy "screenshots_delete_own_org"
  on storage.objects for delete
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where id in (select public.user_organization_ids())
    )
  );

-- ---------------------------------------------------------------------------
-- Share link editable verify → membership
-- ---------------------------------------------------------------------------
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

  if link.organization_id not in (select public.user_organization_ids()) then
    return null;
  end if;

  return jsonb_build_object(
    'resourceType', link.resource_type,
    'resourceId', link.resource_id,
    'organizationId', link.organization_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPCs: invitations + workspace bootstrap
-- ---------------------------------------------------------------------------
create or replace function public.list_my_memberships()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  clerk_id text := public.current_clerk_user_id();
begin
  if clerk_id = '' then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'organizationId', m.organization_id,
          'organizationName', o.name,
          'workspaceType', o.workspace_type,
          'website', o.website,
          'role', m.role,
          'capabilities', m.capabilities,
          'status', m.status,
          'joinedAt', m.joined_at
        )
        order by m.joined_at asc
      )
      from public.organization_members m
      join public.organizations o on o.id = m.organization_id
      where m.clerk_user_id = clerk_id
        and m.status = 'active'
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.list_my_pending_invitations()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  email text := lower(coalesce(public.current_user_email(), ''));
begin
  if email = '' then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'organizationId', i.organization_id,
          'organizationName', o.name,
          'email', i.email,
          'role', i.role,
          'capabilities', i.capabilities,
          'token', i.token,
          'expiresAt', i.expires_at,
          'invitedByEmail', i.invited_by_email,
          'createdAt', i.created_at
        )
        order by i.created_at desc
      )
      from public.organization_invitations i
      join public.organizations o on o.id = i.organization_id
      where i.email = email
        and i.accepted_at is null
        and i.revoked_at is null
        and i.expires_at > now()
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.create_personal_workspace(p_name text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  email text := lower(coalesce(public.current_user_email(), ''));
  workspace_name text;
  org_id uuid;
  existing_personal uuid;
begin
  if clerk_id = '' then
    raise exception 'Not authenticated';
  end if;

  select m.organization_id into existing_personal
  from public.organization_members m
  join public.organizations o on o.id = m.organization_id
  where m.clerk_user_id = clerk_id
    and m.status = 'active'
    and o.workspace_type = 'personal'
  limit 1;

  if existing_personal is not null then
    return jsonb_build_object('organizationId', existing_personal, 'created', false);
  end if;

  workspace_name := coalesce(
    nullif(trim(p_name), ''),
    case when email <> '' then split_part(email, '@', 1) || '''s workspace' else 'Personal workspace' end
  );

  insert into public.organizations (
    clerk_user_id,
    owner_clerk_user_id,
    name,
    workspace_type,
    owner_email,
    created_by,
    updated_by
  )
  values (
    clerk_id,
    clerk_id,
    workspace_name,
    'personal',
    nullif(email, ''),
    nullif(email, ''),
    nullif(email, '')
  )
  returning id into org_id;

  insert into public.organization_members (
    organization_id,
    clerk_user_id,
    email,
    role,
    capabilities,
    status
  )
  values (
    org_id,
    clerk_id,
    coalesce(nullif(email, ''), lower(clerk_id || '@unknown.local')),
    'admin',
    public.default_admin_capabilities(),
    'active'
  );

  return jsonb_build_object('organizationId', org_id, 'created', true);
end;
$$;

create or replace function public.create_team_workspace(
  p_name text,
  p_website text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  email text := lower(coalesce(public.current_user_email(), ''));
  org_id uuid;
  clean_name text := trim(p_name);
  clean_website text := trim(p_website);
begin
  if clerk_id = '' then
    raise exception 'Not authenticated';
  end if;
  if clean_name = '' then
    raise exception 'Organization name is required';
  end if;
  if clean_website = '' then
    raise exception 'Website is required';
  end if;

  insert into public.organizations (
    clerk_user_id,
    owner_clerk_user_id,
    name,
    website,
    workspace_type,
    owner_email,
    created_by,
    updated_by
  )
  values (
    clerk_id,
    clerk_id,
    clean_name,
    clean_website,
    'team',
    nullif(email, ''),
    nullif(email, ''),
    nullif(email, '')
  )
  returning id into org_id;

  insert into public.organization_members (
    organization_id,
    clerk_user_id,
    email,
    role,
    capabilities,
    status
  )
  values (
    org_id,
    clerk_id,
    coalesce(nullif(email, ''), lower(clerk_id || '@unknown.local')),
    'admin',
    public.default_admin_capabilities(),
    'active'
  );

  return jsonb_build_object('organizationId', org_id, 'created', true);
end;
$$;

create or replace function public.create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role text default 'member',
  p_capabilities jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  inviter_email text := lower(coalesce(public.current_user_email(), ''));
  invitee text := lower(trim(p_email));
  caps jsonb;
  invite_token text;
  invite_id uuid;
  expires timestamptz;
begin
  if clerk_id = '' then
    raise exception 'Not authenticated';
  end if;
  if not public.is_org_admin(p_organization_id) then
    raise exception 'Only admins can invite members';
  end if;
  if invitee = '' or position('@' in invitee) = 0 then
    raise exception 'Valid email is required';
  end if;
  if p_role not in ('admin', 'member') then
    raise exception 'Invalid role';
  end if;

  if exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id
      and m.email = invitee
      and m.status = 'active'
  ) then
    raise exception 'User is already a member';
  end if;

  caps := coalesce(
    p_capabilities,
    case when p_role = 'admin'
      then public.default_admin_capabilities()
      else public.default_member_capabilities()
    end
  );

  -- Revoke any prior pending invite for same email
  update public.organization_invitations
  set revoked_at = now(), updated_at = now()
  where organization_id = p_organization_id
    and email = invitee
    and accepted_at is null
    and revoked_at is null;

  invite_token := encode(gen_random_bytes(24), 'hex');
  expires := now() + interval '7 days';

  insert into public.organization_invitations (
    organization_id,
    email,
    role,
    capabilities,
    token,
    invited_by_email,
    invited_by_clerk_user_id,
    expires_at
  )
  values (
    p_organization_id,
    invitee,
    p_role,
    caps,
    invite_token,
    nullif(inviter_email, ''),
    clerk_id,
    expires
  )
  returning id into invite_id;

  return jsonb_build_object(
    'id', invite_id,
    'token', invite_token,
    'email', invitee,
    'role', p_role,
    'capabilities', caps,
    'expiresAt', expires
  );
end;
$$;

create or replace function public.resend_organization_invitation(p_invitation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.organization_invitations;
  new_expires timestamptz;
begin
  select * into inv from public.organization_invitations where id = p_invitation_id;
  if inv.id is null then
    raise exception 'Invitation not found';
  end if;
  if not public.is_org_admin(inv.organization_id) then
    raise exception 'Only admins can resend invitations';
  end if;
  if inv.accepted_at is not null then
    raise exception 'Invitation already accepted';
  end if;
  if inv.revoked_at is not null then
    raise exception 'Invitation was revoked';
  end if;

  new_expires := now() + interval '7 days';

  update public.organization_invitations
  set
    expires_at = new_expires,
    resent_at = now(),
    updated_at = now()
  where id = p_invitation_id;

  return jsonb_build_object(
    'id', inv.id,
    'token', inv.token,
    'email', inv.email,
    'expiresAt', new_expires
  );
end;
$$;

create or replace function public.revoke_organization_invitation(p_invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.organization_invitations;
begin
  select * into inv from public.organization_invitations where id = p_invitation_id;
  if inv.id is null then
    raise exception 'Invitation not found';
  end if;
  if not public.is_org_admin(inv.organization_id) then
    raise exception 'Only admins can revoke invitations';
  end if;

  update public.organization_invitations
  set revoked_at = now(), updated_at = now()
  where id = p_invitation_id;

  return true;
end;
$$;

create or replace function public.accept_organization_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  email text := lower(coalesce(public.current_user_email(), ''));
  inv public.organization_invitations;
begin
  if clerk_id = '' then
    raise exception 'Not authenticated';
  end if;
  if email = '' then
    raise exception 'Email required';
  end if;

  select * into inv
  from public.organization_invitations
  where token = p_token;

  if inv.id is null then
    raise exception 'Invitation not found';
  end if;
  if inv.revoked_at is not null then
    raise exception 'Invitation was revoked';
  end if;
  if inv.accepted_at is not null then
    raise exception 'Invitation already accepted';
  end if;
  if inv.expires_at <= now() then
    raise exception 'Invitation has expired';
  end if;
  if inv.email <> email then
    raise exception 'Invitation email does not match your account';
  end if;

  insert into public.organization_members (
    organization_id,
    clerk_user_id,
    email,
    role,
    capabilities,
    status
  )
  values (
    inv.organization_id,
    clerk_id,
    email,
    inv.role,
    inv.capabilities,
    'active'
  )
  on conflict (organization_id, clerk_user_id) do update
  set
    email = excluded.email,
    role = excluded.role,
    capabilities = excluded.capabilities,
    status = 'active',
    updated_at = now();

  update public.organization_invitations
  set accepted_at = now(), updated_at = now()
  where id = inv.id;

  return jsonb_build_object(
    'organizationId', inv.organization_id,
    'role', inv.role,
    'capabilities', inv.capabilities
  );
end;
$$;

create or replace function public.update_member_capabilities(
  p_member_id uuid,
  p_capabilities jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  mem public.organization_members;
begin
  select * into mem from public.organization_members where id = p_member_id;
  if mem.id is null then
    raise exception 'Member not found';
  end if;
  if not public.is_org_admin(mem.organization_id) then
    raise exception 'Only admins can update capabilities';
  end if;

  update public.organization_members
  set capabilities = p_capabilities, updated_at = now()
  where id = p_member_id;

  return true;
end;
$$;

create or replace function public.set_member_status(
  p_member_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  mem public.organization_members;
  admin_count int;
begin
  if p_status not in ('active', 'disabled') then
    raise exception 'Invalid status';
  end if;

  select * into mem from public.organization_members where id = p_member_id;
  if mem.id is null then
    raise exception 'Member not found';
  end if;
  if not public.is_org_admin(mem.organization_id) then
    raise exception 'Only admins can change member status';
  end if;

  if p_status = 'disabled' and mem.role = 'admin' then
    select count(*) into admin_count
    from public.organization_members
    where organization_id = mem.organization_id
      and role = 'admin'
      and status = 'active';
    if admin_count <= 1 then
      raise exception 'Cannot disable the sole admin';
    end if;
  end if;

  if mem.clerk_user_id = public.current_clerk_user_id() and p_status = 'disabled' then
    raise exception 'Cannot disable yourself';
  end if;

  update public.organization_members
  set status = p_status, updated_at = now()
  where id = p_member_id;

  return true;
end;
$$;

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
    )
  );
end;
$$;

grant execute on function public.default_admin_capabilities() to authenticated;
grant execute on function public.default_member_capabilities() to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.member_has_capability(uuid, text) to authenticated;
grant execute on function public.list_my_memberships() to authenticated;
grant execute on function public.list_my_pending_invitations() to authenticated;
grant execute on function public.create_personal_workspace(text) to authenticated;
grant execute on function public.create_team_workspace(text, text) to authenticated;
grant execute on function public.create_organization_invitation(uuid, text, text, jsonb) to authenticated;
grant execute on function public.resend_organization_invitation(uuid) to authenticated;
grant execute on function public.revoke_organization_invitation(uuid) to authenticated;
grant execute on function public.accept_organization_invitation(text) to authenticated;
grant execute on function public.update_member_capabilities(uuid, jsonb) to authenticated;
grant execute on function public.set_member_status(uuid, text) to authenticated;
grant execute on function public.get_org_admin_activity(uuid, int) to authenticated;
