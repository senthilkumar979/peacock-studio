-- Idempotent log for founder welcome emails (Clerk user.created → Edge Function).
-- No organization_id: welcome fires before workspace onboarding.

create table if not exists public.welcome_email_sends (
  clerk_user_id text primary key,
  to_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists welcome_email_sends_created_at_idx
  on public.welcome_email_sends (created_at desc);

alter table public.welcome_email_sends enable row level security;

-- Service-role only from the Edge Function; no client policies.
comment on table public.welcome_email_sends is
  'One row per Clerk user who was sent the founder welcome email; prevents webhook retry duplicates.';
