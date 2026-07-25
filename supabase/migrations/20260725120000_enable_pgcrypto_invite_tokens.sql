-- gen_random_bytes requires pgcrypto (not available by default on all Postgres installs).
create extension if not exists pgcrypto with schema extensions;

create or replace function public.create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role text default 'member',
  p_capabilities jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  inviter_email text := lower(coalesce(public.current_user_email(), ''));
  invitee text := lower(trim(p_email));
  caps jsonb;
  invite_token text;
  invite_id uuid;
  expires timestamptz;
  org_workspace text;
begin
  if clerk_id = '' then
    raise exception 'Not authenticated';
  end if;
  if not public.is_org_admin(p_organization_id) then
    raise exception 'Only admins can invite members';
  end if;

  select workspace_type into org_workspace
  from public.organizations
  where id = p_organization_id;

  if org_workspace is null then
    raise exception 'Organization not found';
  end if;
  if org_workspace <> 'team' then
    raise exception 'Invites are only available for team workspaces. Create or switch to a team workspace to invite members.';
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

  update public.organization_invitations
  set revoked_at = now(), updated_at = now()
  where organization_id = p_organization_id
    and email = invitee
    and accepted_at is null
    and revoked_at is null;

  invite_token := encode(extensions.gen_random_bytes(24), 'hex');
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
