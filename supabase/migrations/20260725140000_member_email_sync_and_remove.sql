-- Fix placeholder member emails (user_*@unknown.local) by syncing from user_profiles,
-- and allow admins to fully remove a member from an organization.

-- Prefer JWT email, then the signed-in user's profile row.
create or replace function public.resolve_actor_email()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  email text;
  clerk_id text := public.current_clerk_user_id();
begin
  email := lower(coalesce(nullif(trim(coalesce(public.current_user_email(), '')), ''), ''));
  if email = '' and clerk_id <> '' then
    select lower(up.email) into email
    from public.user_profiles up
    where up.clerk_user_id = clerk_id
    limit 1;
  end if;
  return coalesce(email, '');
end;
$$;

-- Backfill placeholder emails from profiles (one-time data repair).
update public.organization_members m
set
  email = lower(p.email),
  updated_at = now()
from public.user_profiles p
where m.clerk_user_id = p.clerk_user_id
  and p.email is not null
  and p.email <> ''
  and p.email not like '%@unknown.local'
  and (
    m.email like '%@unknown.local'
    or m.email = lower(m.clerk_user_id || '@unknown.local')
  );

-- Keep the caller's membership emails in sync after profile upsert.
create or replace function public.sync_my_membership_emails()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  email text := public.resolve_actor_email();
  updated_count integer := 0;
begin
  if clerk_id = '' or email = '' or email like '%@unknown.local' then
    return 0;
  end if;

  update public.organization_members
  set email = email, updated_at = now()
  where clerk_user_id = clerk_id
    and (
      organization_members.email like '%@unknown.local'
      or organization_members.email <> email
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function public.remove_organization_member(p_member_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  mem public.organization_members;
  admin_count int;
begin
  select * into mem from public.organization_members where id = p_member_id;
  if mem.id is null then
    raise exception 'Member not found';
  end if;
  if not public.is_org_admin(mem.organization_id) then
    raise exception 'Only admins can remove members';
  end if;
  if mem.clerk_user_id = public.current_clerk_user_id() then
    raise exception 'Cannot remove yourself';
  end if;

  if mem.role = 'admin' and mem.status = 'active' then
    select count(*) into admin_count
    from public.organization_members
    where organization_id = mem.organization_id
      and role = 'admin'
      and status = 'active';
    if admin_count <= 1 then
      raise exception 'Cannot remove the sole admin';
    end if;
  end if;

  delete from public.organization_members where id = p_member_id;
  return true;
end;
$$;

grant execute on function public.resolve_actor_email() to authenticated;
grant execute on function public.sync_my_membership_emails() to authenticated;
grant execute on function public.remove_organization_member(uuid) to authenticated;
