-- Peacock Studio cloud library (Phase 0–2)
-- Run via Supabase CLI: supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  name text not null default 'Personal workspace',
  plan text not null default 'free',
  storage_bytes bigint not null default 0 check (storage_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_documents (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  saved_at bigint not null,
  updated_at bigint not null,
  flow jsonb not null,
  steps jsonb not null,
  share_settings jsonb,
  created_at timestamptz not null default now()
);

create index if not exists flow_documents_org_updated_idx
  on public.flow_documents (organization_id, updated_at desc);

create table if not exists public.screenshot_assets (
  id text not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_id text not null references public.flow_documents (id) on delete cascade,
  storage_path text not null,
  content_hash text not null,
  byte_size bigint not null default 0 check (byte_size >= 0),
  created_at timestamptz not null default now(),
  primary key (organization_id, document_id, id)
);

create unique index if not exists screenshot_assets_org_hash_uidx
  on public.screenshot_assets (organization_id, content_hash);

create table if not exists public.personas (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  occupation text not null,
  age integer,
  short_bio text not null,
  default_goal text,
  gender text not null,
  avatar_id text not null,
  company text,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists personas_org_updated_idx
  on public.personas (organization_id, updated_at desc);

create table if not exists public.product_tours (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'draft',
  persona_id text not null,
  tour_goal text not null default '',
  features jsonb not null default '[]'::jsonb,
  completion_cta jsonb,
  migrated_from_route boolean not null default false,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists product_tours_org_updated_idx
  on public.product_tours (organization_id, updated_at desc);

alter table public.organizations enable row level security;
alter table public.flow_documents enable row level security;
alter table public.screenshot_assets enable row level security;
alter table public.personas enable row level security;
alter table public.product_tours enable row level security;

create or replace function public.current_clerk_user_id()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'sub', '');
$$;

create or replace function public.user_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.organizations where clerk_user_id = public.current_clerk_user_id();
$$;

create policy "organizations_select_own"
  on public.organizations for select
  using (clerk_user_id = public.current_clerk_user_id());

create policy "organizations_insert_own"
  on public.organizations for insert
  with check (clerk_user_id = public.current_clerk_user_id());

create policy "organizations_update_own"
  on public.organizations for update
  using (clerk_user_id = public.current_clerk_user_id())
  with check (clerk_user_id = public.current_clerk_user_id());

create policy "flow_documents_all_own_org"
  on public.flow_documents for all
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

create policy "screenshot_assets_all_own_org"
  on public.screenshot_assets for all
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

create policy "personas_all_own_org"
  on public.personas for all
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

create policy "product_tours_all_own_org"
  on public.product_tours for all
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));

insert into storage.buckets (id, name, public, file_size_limit)
values ('screenshots', 'screenshots', false, 52428800)
on conflict (id) do nothing;

create policy "screenshots_select_own_org"
  on storage.objects for select
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy "screenshots_insert_own_org"
  on storage.objects for insert
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy "screenshots_update_own_org"
  on storage.objects for update
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where clerk_user_id = public.current_clerk_user_id()
    )
  )
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy "screenshots_delete_own_org"
  on storage.objects for delete
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.organizations
      where clerk_user_id = public.current_clerk_user_id()
    )
  );
