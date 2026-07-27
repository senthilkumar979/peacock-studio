-- requires_auth shares require org membership (not any signed-in Clerk user).
-- Email send audit/rate-limit tables and invite pending cap.
-- Revoke direct anon execute on share content RPCs (Edge Function gate owns public path).

-- ---------------------------------------------------------------------------
-- Auth-gated shares: must be an active org member
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
    or (
      public.current_clerk_user_id() <> ''
      and p_link.organization_id in (select public.user_organization_ids())
    );
$$;

-- ---------------------------------------------------------------------------
-- Invite email audit + rate limiting
-- ---------------------------------------------------------------------------
create table if not exists public.email_send_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  caller_clerk_user_id text not null,
  to_email text not null,
  invitation_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists email_send_log_caller_created_idx
  on public.email_send_log (caller_clerk_user_id, created_at desc);

create index if not exists email_send_log_org_created_idx
  on public.email_send_log (organization_id, created_at desc);

alter table public.email_send_log enable row level security;

drop policy if exists "email_send_log_admin_select" on public.email_send_log;
create policy "email_send_log_admin_select"
  on public.email_send_log for select
  using (public.is_org_admin(organization_id));

-- Generic edge rate-limit buckets (invite email + public share resolve)
create table if not exists public.edge_rate_limits (
  bucket text not null,
  rate_key text not null,
  window_start timestamptz not null,
  hit_count integer not null default 0,
  primary key (bucket, rate_key, window_start)
);

alter table public.edge_rate_limits enable row level security;
-- No client policies: only security definer / service role touch this table.

create or replace function public.check_and_increment_rate_limit(
  p_bucket text,
  p_rate_key text,
  p_limit integer,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_window_start timestamptz;
  current_count integer;
begin
  if p_bucket = '' or p_rate_key = '' or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.edge_rate_limits (bucket, rate_key, window_start, hit_count)
  values (p_bucket, p_rate_key, v_window_start, 1)
  on conflict (bucket, rate_key, window_start)
  do update set hit_count = public.edge_rate_limits.hit_count + 1
  returning hit_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.check_and_increment_rate_limit(text, text, integer, integer) from public;
grant execute on function public.check_and_increment_rate_limit(text, text, integer, integer)
  to service_role;

-- Claim invite email send: admin-only, rate-limited, returns Resend payload fields
create or replace function public.claim_org_invite_email_send(p_invitation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  inv public.organization_invitations%rowtype;
  org_name text;
begin
  if clerk_id = '' then
    raise exception 'Not authenticated';
  end if;

  select * into inv
  from public.organization_invitations
  where id = p_invitation_id
  for update;

  if inv.id is null then
    raise exception 'Invitation not found';
  end if;

  if not public.is_org_admin(inv.organization_id) then
    raise exception 'Only admins can send invite emails';
  end if;

  if inv.revoked_at is not null or inv.accepted_at is not null then
    raise exception 'Invitation is no longer pending';
  end if;

  if inv.expires_at is not null and inv.expires_at <= now() then
    raise exception 'Invitation has expired';
  end if;

  if not public.check_and_increment_rate_limit(
    'invite_email',
    clerk_id,
    10,
    3600
  ) then
    raise exception 'Invite email rate limit exceeded';
  end if;

  select name into org_name
  from public.organizations
  where id = inv.organization_id;

  insert into public.email_send_log (
    organization_id,
    caller_clerk_user_id,
    to_email,
    invitation_id
  )
  values (
    inv.organization_id,
    clerk_id,
    inv.email,
    inv.id
  );

  return jsonb_build_object(
    'invitationId', inv.id,
    'organizationId', inv.organization_id,
    'organizationName', coalesce(org_name, 'Workspace'),
    'toEmail', inv.email,
    'inviteToken', inv.token,
    'expiresAt', inv.expires_at
  );
end;
$$;

revoke all on function public.claim_org_invite_email_send(uuid) from public;
grant execute on function public.claim_org_invite_email_send(uuid) to authenticated;

-- Cap open pending invites per org (50)
create or replace function public.enforce_pending_invite_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  open_count integer;
begin
  select count(*)::integer into open_count
  from public.organization_invitations
  where organization_id = new.organization_id
    and accepted_at is null
    and revoked_at is null
    and (expires_at is null or expires_at > now());

  if open_count >= 50 then
    raise exception 'Pending invite limit reached for this workspace';
  end if;

  return new;
end;
$$;

drop trigger if exists organization_invitations_pending_cap on public.organization_invitations;
create trigger organization_invitations_pending_cap
  before insert on public.organization_invitations
  for each row
  execute function public.enforce_pending_invite_cap();

-- ---------------------------------------------------------------------------
-- Public share path: revoke anon execute (Edge Function + service_role / user JWT)
-- ---------------------------------------------------------------------------
revoke execute on function public.resolve_share_link(text) from anon;
revoke execute on function public.get_shared_flow_document(text, text) from anon;
revoke execute on function public.get_shared_product_tour(text) from anon;
revoke execute on function public.get_shared_persona(text, text) from anon;
revoke execute on function public.list_shared_screenshot_assets(text, text) from anon;

grant execute on function public.resolve_share_link(text) to authenticated, service_role;
grant execute on function public.get_shared_flow_document(text, text) to authenticated, service_role;
grant execute on function public.get_shared_product_tour(text) to authenticated, service_role;
grant execute on function public.get_shared_persona(text, text) to authenticated, service_role;
grant execute on function public.list_shared_screenshot_assets(text, text) to authenticated, service_role;

-- Rate-limit helper usable from Edge Functions via PostgREST with service role
create or replace function public.consume_edge_rate_limit(
  p_bucket text,
  p_rate_key text,
  p_limit integer,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.check_and_increment_rate_limit(
    p_bucket,
    p_rate_key,
    p_limit,
    p_window_seconds
  );
end;
$$;

revoke all on function public.consume_edge_rate_limit(text, text, integer, integer) from public;
grant execute on function public.consume_edge_rate_limit(text, text, integer, integer)
  to service_role;
