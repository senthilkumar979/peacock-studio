-- Fix user_profiles upsert RLS: ownership is by clerk_user_id only.
-- The previous INSERT policy required JWT email to match the row email, which
-- fails when Clerk session tokens omit/mismatch email claims. Upserts then
-- fall through to UPDATE and hit USING failures (Sentry PEACOCK-STUDIO-14).

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  to authenticated
  with check (
    clerk_user_id = public.current_clerk_user_id()
    and email = lower(email)
  );

create policy "user_profiles_update_own"
  on public.user_profiles for update
  to authenticated
  using (clerk_user_id = public.current_clerk_user_id())
  with check (
    clerk_user_id = public.current_clerk_user_id()
    and email = lower(email)
  );

-- Cross-org persona id collision probe (personas.id is a global PK).
create or replace function public.persona_id_taken(p_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.personas where id = p_id);
$$;

revoke all on function public.persona_id_taken(text) from public;
grant execute on function public.persona_id_taken(text) to authenticated;
