-- Fix ambiguous `email` variable vs column in sync_my_membership_emails.
-- PostgREST returned HTTP 400 because PL/pgSQL treated `set email = email` as ambiguous.

create or replace function public.sync_my_membership_emails()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  clerk_id text := public.current_clerk_user_id();
  actor_email text := public.resolve_actor_email();
  updated_count integer := 0;
begin
  if clerk_id = '' or actor_email = '' or actor_email like '%@unknown.local' then
    return 0;
  end if;

  update public.organization_members
  set email = actor_email, updated_at = now()
  where clerk_user_id = clerk_id
    and (
      organization_members.email like '%@unknown.local'
      or organization_members.email <> actor_email
    );

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.sync_my_membership_emails() to authenticated;
