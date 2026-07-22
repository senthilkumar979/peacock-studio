-- User profiles: single source of truth for display names.
-- Rows keep created_by / updated_by as email and resolve names via this table.

create table if not exists public.user_profiles (
  email text primary key,
  clerk_user_id text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_email_lower check (email = lower(email))
);

create index if not exists user_profiles_clerk_user_id_idx
  on public.user_profiles (clerk_user_id);

alter table public.user_profiles enable row level security;

-- Authenticated users can read profiles (needed to render "Updated by {name}").
create policy "user_profiles_select_authenticated"
  on public.user_profiles for select
  to authenticated
  using (true);

-- Users may insert/update only their own profile row.
create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  to authenticated
  with check (
    clerk_user_id = public.current_clerk_user_id()
    and email = lower(coalesce(public.current_user_email(), email))
  );

create policy "user_profiles_update_own"
  on public.user_profiles for update
  to authenticated
  using (clerk_user_id = public.current_clerk_user_id())
  with check (clerk_user_id = public.current_clerk_user_id());

-- Drop denormalized display-name columns from resource tables.
alter table public.organizations
  drop column if exists owner_name,
  drop column if exists created_by_name,
  drop column if exists updated_by_name;

alter table public.flow_documents
  drop column if exists created_by_name,
  drop column if exists updated_by_name;

alter table public.personas
  drop column if exists created_by_name,
  drop column if exists updated_by_name;

alter table public.product_tours
  drop column if exists created_by_name,
  drop column if exists updated_by_name;

alter table public.share_links
  drop column if exists created_by_name,
  drop column if exists updated_by_name;

alter table public.workflow_artifacts
  drop column if exists created_by_name,
  drop column if exists updated_by_name;

-- Audit trigger: email only (no per-row display names).
create or replace function public.apply_row_audit()
returns trigger
language plpgsql
as $$
declare
  email text := public.current_user_email();
begin
  if tg_op = 'INSERT' then
    if new.created_by is null or btrim(new.created_by) = '' then
      new.created_by := email;
    end if;
    if new.updated_by is null or btrim(new.updated_by) = '' then
      new.updated_by := coalesce(email, new.created_by);
    end if;
    if new.created_at is null then
      new.created_at := now();
    end if;
    if new.updated_at is null then
      new.updated_at := coalesce(new.created_at, now());
    end if;
    return new;
  end if;

  new.created_by := old.created_by;

  if tg_table_name = 'flow_documents' then
    new.created_at := old.created_at;
    new.saved_at := old.saved_at;
  elsif tg_table_name in (
    'personas',
    'product_tours',
    'workflow_artifacts',
    'organizations',
    'share_links'
  ) then
    new.created_at := old.created_at;
  end if;

  if email is not null then
    new.updated_by := email;
  elsif new.updated_by is null or btrim(new.updated_by) = '' then
    new.updated_by := old.updated_by;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

-- Shared payloads: email only; clients resolve names from user_profiles.
create or replace function public.get_shared_flow_document(
  p_token text,
  p_document_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
  doc public.flow_documents%rowtype;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null then
    return null;
  end if;

  if not public.share_link_document_allowed(link, p_document_id) then
    return null;
  end if;

  select *
  into doc
  from public.flow_documents
  where id = p_document_id
    and organization_id = link.organization_id;

  if doc.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', doc.id,
    'savedAt', doc.saved_at,
    'updatedAt', doc.updated_at,
    'createdBy', doc.created_by,
    'updatedBy', doc.updated_by,
    'flow', doc.flow,
    'steps', doc.steps,
    'shareSettings', doc.share_settings
  );
end;
$$;

create or replace function public.get_shared_product_tour(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
  tour public.product_tours%rowtype;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null or link.resource_type <> 'tour' then
    return null;
  end if;

  select *
  into tour
  from public.product_tours
  where id = link.resource_id
    and organization_id = link.organization_id;

  if tour.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', tour.id,
    'title', tour.title,
    'description', tour.description,
    'status', tour.status,
    'personaId', tour.persona_id,
    'tourGoal', tour.tour_goal,
    'features', tour.features,
    'completionCta', tour.completion_cta,
    'migratedFromRoute', tour.migrated_from_route,
    'createdAt', tour.created_at,
    'updatedAt', tour.updated_at,
    'createdBy', tour.created_by,
    'updatedBy', tour.updated_by
  );
end;
$$;

create or replace function public.get_shared_persona(
  p_token text,
  p_persona_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
  persona public.personas%rowtype;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null then
    return null;
  end if;

  select *
  into persona
  from public.personas
  where id = p_persona_id
    and organization_id = link.organization_id;

  if persona.id is null then
    return null;
  end if;

  if link.resource_type = 'tour' then
    if not exists (
      select 1
      from public.product_tours pt
      where pt.id = link.resource_id
        and pt.organization_id = link.organization_id
        and pt.persona_id = persona.id
    ) then
      return null;
    end if;
  else
    return null;
  end if;

  return jsonb_build_object(
    'id', persona.id,
    'name', persona.name,
    'occupation', persona.occupation,
    'age', persona.age,
    'shortBio', persona.short_bio,
    'defaultGoal', persona.default_goal,
    'gender', persona.gender,
    'avatarId', persona.avatar_id,
    'company', persona.company,
    'createdAt', persona.created_at,
    'updatedAt', persona.updated_at,
    'createdBy', persona.created_by,
    'updatedBy', persona.updated_by
  );
end;
$$;

-- Seed profiles from organizations that already have owner_email.
insert into public.user_profiles (email, clerk_user_id, display_name)
select
  lower(o.owner_email),
  o.clerk_user_id,
  coalesce(
    nullif(trim(regexp_replace(o.name, '''s workspace$', '')), ''),
    split_part(o.owner_email, '@', 1)
  )
from public.organizations o
where o.owner_email is not null
  and btrim(o.owner_email) <> ''
on conflict (email) do update
set
  clerk_user_id = excluded.clerk_user_id,
  display_name = excluded.display_name,
  updated_at = now();
