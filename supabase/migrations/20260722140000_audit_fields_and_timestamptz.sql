-- Audit fields + timestamptz normalization + analytics actor_email
-- Cleaner long-term: store created_at/updated_at as timestamptz and
-- created_by/updated_by as Clerk primary email (email changes locked in Clerk).

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select nullif(
    trim(
      coalesce(
        auth.jwt() ->> 'email',
        auth.jwt() -> 'user_metadata' ->> 'email',
        auth.jwt() -> 'user_metadata' ->> 'primary_email_address',
        ''
      )
    ),
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists owner_email text,
  add column if not exists created_by text,
  add column if not exists updated_by text;

update public.organizations
set
  created_by = coalesce(created_by, owner_email),
  updated_by = coalesce(updated_by, owner_email)
where owner_email is not null;

-- ---------------------------------------------------------------------------
-- flow_documents: bigint ms → timestamptz + email stamps
-- ---------------------------------------------------------------------------
alter table public.flow_documents
  add column if not exists created_by text,
  add column if not exists updated_by text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'flow_documents'
      and column_name = 'updated_at'
      and data_type = 'bigint'
  ) then
    alter table public.flow_documents
      alter column updated_at type timestamptz
      using to_timestamp(updated_at / 1000.0);
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'flow_documents'
      and column_name = 'saved_at'
      and data_type = 'bigint'
  ) then
    alter table public.flow_documents
      alter column saved_at type timestamptz
      using to_timestamp(saved_at / 1000.0);
  end if;
end $$;

update public.flow_documents
set created_at = coalesce(created_at, saved_at, now())
where created_at is null;

-- ---------------------------------------------------------------------------
-- personas
-- ---------------------------------------------------------------------------
alter table public.personas
  add column if not exists created_by text,
  add column if not exists updated_by text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'personas'
      and column_name = 'created_at'
      and data_type = 'bigint'
  ) then
    alter table public.personas
      alter column created_at type timestamptz
      using to_timestamp(created_at / 1000.0);
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'personas'
      and column_name = 'updated_at'
      and data_type = 'bigint'
  ) then
    alter table public.personas
      alter column updated_at type timestamptz
      using to_timestamp(updated_at / 1000.0);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- product_tours
-- ---------------------------------------------------------------------------
alter table public.product_tours
  add column if not exists created_by text,
  add column if not exists updated_by text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_tours'
      and column_name = 'created_at'
      and data_type = 'bigint'
  ) then
    alter table public.product_tours
      alter column created_at type timestamptz
      using to_timestamp(created_at / 1000.0);
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_tours'
      and column_name = 'updated_at'
      and data_type = 'bigint'
  ) then
    alter table public.product_tours
      alter column updated_at type timestamptz
      using to_timestamp(updated_at / 1000.0);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- share_links: migrate created_by clerk id → owner email; add updated_by
-- ---------------------------------------------------------------------------
alter table public.share_links
  add column if not exists updated_by text;

update public.share_links sl
set created_by = o.owner_email
from public.organizations o
where sl.organization_id = o.id
  and o.owner_email is not null
  and o.owner_email <> ''
  and (
    sl.created_by = o.clerk_user_id
    or sl.created_by !~ '^[^@]+@[^@]+$'
  );

update public.share_links sl
set updated_by = coalesce(sl.updated_by, sl.created_by)
where sl.updated_by is null;

-- ---------------------------------------------------------------------------
-- workflow_artifacts
-- ---------------------------------------------------------------------------
alter table public.workflow_artifacts
  add column if not exists created_by text,
  add column if not exists updated_by text,
  add column if not exists created_at timestamptz;

update public.workflow_artifacts
set created_at = coalesce(created_at, generated_at, updated_at, now())
where created_at is null;

alter table public.workflow_artifacts
  alter column created_at set default now();

update public.workflow_artifacts
set
  created_by = coalesce(created_by, updated_by),
  updated_by = coalesce(updated_by, created_by);

-- ---------------------------------------------------------------------------
-- screenshot_assets
-- ---------------------------------------------------------------------------
alter table public.screenshot_assets
  add column if not exists created_by text;

-- ---------------------------------------------------------------------------
-- analytics_events: actor_email for signed-in org events
-- ---------------------------------------------------------------------------
alter table public.analytics_events
  add column if not exists actor_email text;

create index if not exists analytics_events_actor_email_idx
  on public.analytics_events (actor_email)
  where actor_email is not null;

-- ---------------------------------------------------------------------------
-- Audit trigger: stamp email from JWT; preserve created_* on update
-- ---------------------------------------------------------------------------
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

  -- UPDATE: never let clients rewrite provenance
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

drop trigger if exists flow_documents_audit on public.flow_documents;
create trigger flow_documents_audit
  before insert or update on public.flow_documents
  for each row execute function public.apply_row_audit();

drop trigger if exists personas_audit on public.personas;
create trigger personas_audit
  before insert or update on public.personas
  for each row execute function public.apply_row_audit();

drop trigger if exists product_tours_audit on public.product_tours;
create trigger product_tours_audit
  before insert or update on public.product_tours
  for each row execute function public.apply_row_audit();

drop trigger if exists share_links_audit on public.share_links;
create trigger share_links_audit
  before insert or update on public.share_links
  for each row execute function public.apply_row_audit();

drop trigger if exists workflow_artifacts_audit on public.workflow_artifacts;
create trigger workflow_artifacts_audit
  before insert or update on public.workflow_artifacts
  for each row execute function public.apply_row_audit();

drop trigger if exists organizations_audit on public.organizations;
create trigger organizations_audit
  before insert or update on public.organizations
  for each row execute function public.apply_row_audit();

create or replace function public.screenshot_assets_set_created_by()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null or btrim(new.created_by) = '' then
    new.created_by := public.current_user_email();
  end if;
  return new;
end;
$$;

drop trigger if exists screenshot_assets_audit on public.screenshot_assets;
create trigger screenshot_assets_audit
  before insert on public.screenshot_assets
  for each row execute function public.screenshot_assets_set_created_by();

-- ---------------------------------------------------------------------------
-- Backfill created_by/updated_by from organization owner_email when possible
-- ---------------------------------------------------------------------------
update public.flow_documents fd
set
  created_by = coalesce(fd.created_by, o.owner_email),
  updated_by = coalesce(fd.updated_by, o.owner_email)
from public.organizations o
where fd.organization_id = o.id
  and o.owner_email is not null
  and (fd.created_by is null or fd.updated_by is null);

update public.personas p
set
  created_by = coalesce(p.created_by, o.owner_email),
  updated_by = coalesce(p.updated_by, o.owner_email)
from public.organizations o
where p.organization_id = o.id
  and o.owner_email is not null
  and (p.created_by is null or p.updated_by is null);

update public.product_tours t
set
  created_by = coalesce(t.created_by, o.owner_email),
  updated_by = coalesce(t.updated_by, o.owner_email)
from public.organizations o
where t.organization_id = o.id
  and o.owner_email is not null
  and (t.created_by is null or t.updated_by is null);

update public.workflow_artifacts wa
set
  created_by = coalesce(wa.created_by, o.owner_email),
  updated_by = coalesce(wa.updated_by, o.owner_email)
from public.organizations o
where wa.organization_id = o.id
  and o.owner_email is not null
  and (wa.created_by is null or wa.updated_by is null);

-- ---------------------------------------------------------------------------
-- Analytics RPCs: stamp actor_email for authenticated org events
-- ---------------------------------------------------------------------------
create or replace function public.record_org_event(
  p_organization_id uuid,
  p_event_type text,
  p_resource_type text default null,
  p_resource_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_organization_id not in (select public.user_organization_ids()) then
    raise exception 'not a member of organization %', p_organization_id;
  end if;

  if p_event_type not in (
    'pdf_export',
    'document_view',
    'document_mode_change',
    'tour_view',
    'tour_complete',
    'share_link_created',
    'artifact_export'
  ) then
    raise exception 'invalid org event_type: %', p_event_type;
  end if;

  insert into public.analytics_events (
    organization_id,
    event_type,
    resource_type,
    resource_id,
    actor_email,
    metadata
  ) values (
    p_organization_id,
    p_event_type,
    p_resource_type,
    p_resource_id,
    public.current_user_email(),
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

-- Widen event_type check constraint if present
alter table public.analytics_events drop constraint if exists analytics_events_event_type_check;
alter table public.analytics_events
  add constraint analytics_events_event_type_check check (
    event_type in (
      'share_view',
      'embed_view',
      'pdf_export',
      'document_view',
      'document_mode_change',
      'tour_view',
      'tour_complete',
      'share_link_created',
      'artifact_export'
    )
  );

grant execute on function public.current_user_email() to authenticated;
grant execute on function public.record_org_event(uuid, text, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Shared read RPCs: include created_by / updated_by
-- ---------------------------------------------------------------------------
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
