-- Team workspaces only: personal workspaces cannot invite members.

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
  org_workspace text;
begin
  select * into inv from public.organization_invitations where id = p_invitation_id;
  if inv.id is null then
    raise exception 'Invitation not found';
  end if;
  if not public.is_org_admin(inv.organization_id) then
    raise exception 'Only admins can resend invitations';
  end if;

  select workspace_type into org_workspace
  from public.organizations
  where id = inv.organization_id;

  if org_workspace is distinct from 'team' then
    raise exception 'Invites are only available for team workspaces. Create or switch to a team workspace to invite members.';
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

grant execute on function public.create_organization_invitation(uuid, text, text, jsonb) to authenticated;
grant execute on function public.resend_organization_invitation(uuid) to authenticated;
