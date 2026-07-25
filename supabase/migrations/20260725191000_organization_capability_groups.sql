-- Organization capability groups + read capability.

-- ---------------------------------------------------------------------------
-- Default capability shapes (include read)
-- ---------------------------------------------------------------------------
create or replace function public.default_admin_capabilities()
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'read', true,
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
    'read', true,
    'create', true,
    'edit', true,
    'delete', false,
    'share', true,
    'export', true,
    'embed', false
  );
$$;

-- Backfill read on existing rows (legacy = allow read).
update public.organization_members
set capabilities = coalesce(capabilities, '{}'::jsonb) || '{"read": true}'::jsonb
where not (capabilities ? 'read');

update public.organization_invitations
set capabilities = coalesce(capabilities, '{}'::jsonb) || '{"read": true}'::jsonb
where not (capabilities ? 'read');

-- ---------------------------------------------------------------------------
-- Groups
-- ---------------------------------------------------------------------------
create table if not exists public.organization_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text not null default '',
  capabilities jsonb not null default public.default_member_capabilities(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_groups_name_nonempty check (length(trim(name)) > 0),
  unique (organization_id, name)
);

create index if not exists organization_groups_org_idx
  on public.organization_groups (organization_id);

create table if not exists public.organization_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.organization_groups (id) on delete cascade,
  member_id uuid not null references public.organization_members (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, member_id)
);

create index if not exists organization_group_members_member_idx
  on public.organization_group_members (member_id);

create index if not exists organization_group_members_group_idx
  on public.organization_group_members (group_id);

alter table public.organization_groups enable row level security;
alter table public.organization_group_members enable row level security;

drop policy if exists "organization_groups_select_member" on public.organization_groups;
create policy "organization_groups_select_member"
  on public.organization_groups for select
  using (organization_id in (select public.user_organization_ids()));

drop policy if exists "organization_groups_admin_write" on public.organization_groups;
create policy "organization_groups_admin_insert"
  on public.organization_groups for insert
  with check (public.is_org_admin(organization_id));

create policy "organization_groups_admin_update"
  on public.organization_groups for update
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "organization_groups_admin_delete"
  on public.organization_groups for delete
  using (public.is_org_admin(organization_id));

drop policy if exists "organization_group_members_select" on public.organization_group_members;
create policy "organization_group_members_select"
  on public.organization_group_members for select
  using (
    exists (
      select 1
      from public.organization_groups g
      where g.id = group_id
        and g.organization_id in (select public.user_organization_ids())
    )
  );

create policy "organization_group_members_admin_insert"
  on public.organization_group_members for insert
  with check (
    exists (
      select 1
      from public.organization_groups g
      where g.id = group_id
        and public.is_org_admin(g.organization_id)
    )
  );

create policy "organization_group_members_admin_delete"
  on public.organization_group_members for delete
  using (
    exists (
      select 1
      from public.organization_groups g
      where g.id = group_id
        and public.is_org_admin(g.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Capability resolution: personal OR any group (admins still bypass via policies)
-- ---------------------------------------------------------------------------
create or replace function public.member_capability_granted(
  p_capabilities jsonb,
  p_capability text
)
returns boolean
language sql
immutable
as $$
  select coalesce(
    (p_capabilities ->> p_capability)::boolean,
    case when p_capability = 'read' then true else false end
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
      and public.member_capability_granted(m.capabilities, p_capability)
  )
  or exists (
    select 1
    from public.organization_members m
    inner join public.organization_group_members gm on gm.member_id = m.id
    inner join public.organization_groups g on g.id = gm.group_id
    where m.organization_id = p_organization_id
      and g.organization_id = p_organization_id
      and m.clerk_user_id = public.current_clerk_user_id()
      and m.status = 'active'
      and public.member_capability_granted(g.capabilities, p_capability)
  );
$$;

create or replace function public.effective_member_capabilities(
  p_member_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base jsonb;
  group_caps jsonb;
  key text;
begin
  select capabilities into base
  from public.organization_members
  where id = p_member_id;

  if base is null then
    return public.default_member_capabilities();
  end if;

  base := coalesce(base, '{}'::jsonb) || jsonb_build_object(
    'read', public.member_capability_granted(base, 'read')
  );

  for group_caps in
    select g.capabilities
    from public.organization_group_members gm
    join public.organization_groups g on g.id = gm.group_id
    where gm.member_id = p_member_id
  loop
    foreach key in array array['read','create','edit','delete','share','export','embed']
    loop
      if public.member_capability_granted(group_caps, key) then
        base := jsonb_set(base, array[key], 'true'::jsonb, true);
      end if;
    end loop;
  end loop;

  return base;
end;
$$;

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
          'capabilities', case
            when m.role = 'admin' then public.default_admin_capabilities()
            else public.effective_member_capabilities(m.id)
          end,
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

-- Active membership + read (or admin) required to see org-scoped data.
create or replace function public.user_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.organization_id
  from public.organization_members m
  where m.clerk_user_id = public.current_clerk_user_id()
    and m.status = 'active'
    and (
      m.role = 'admin'
      or public.member_has_capability(m.organization_id, 'read')
    );
$$;

grant execute on function public.member_capability_granted(jsonb, text) to authenticated;
grant execute on function public.effective_member_capabilities(uuid) to authenticated;
