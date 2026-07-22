-- Display names for audit actors (email remains the stable audit key in created_by / updated_by).

create or replace function public.current_user_display_name()
returns text
language sql
stable
as $$
  select nullif(
    trim(
      coalesce(
        auth.jwt() ->> 'name',
        auth.jwt() -> 'user_metadata' ->> 'full_name',
        auth.jwt() -> 'user_metadata' ->> 'name',
        nullif(
          trim(
            concat_ws(
              ' ',
              auth.jwt() -> 'user_metadata' ->> 'first_name',
              auth.jwt() -> 'user_metadata' ->> 'last_name'
            )
          ),
          ''
        ),
        public.current_user_email()
      )
    ),
    ''
  );
$$;

alter table public.organizations
  add column if not exists owner_name text,
  add column if not exists created_by_name text,
  add column if not exists updated_by_name text;

alter table public.flow_documents
  add column if not exists created_by_name text,
  add column if not exists updated_by_name text;

alter table public.personas
  add column if not exists created_by_name text,
  add column if not exists updated_by_name text;

alter table public.product_tours
  add column if not exists created_by_name text,
  add column if not exists updated_by_name text;

alter table public.share_links
  add column if not exists created_by_name text,
  add column if not exists updated_by_name text;

alter table public.workflow_artifacts
  add column if not exists created_by_name text,
  add column if not exists updated_by_name text;

-- Prefer owner_name when backfilling display names for rows that only have email.
update public.organizations
set
  owner_name = coalesce(owner_name, name),
  created_by_name = coalesce(created_by_name, owner_name, name),
  updated_by_name = coalesce(updated_by_name, owner_name, name);

update public.flow_documents fd
set
  created_by_name = coalesce(fd.created_by_name, o.owner_name),
  updated_by_name = coalesce(fd.updated_by_name, o.owner_name)
from public.organizations o
where fd.organization_id = o.id
  and o.owner_name is not null
  and (fd.created_by_name is null or fd.updated_by_name is null);

update public.personas p
set
  created_by_name = coalesce(p.created_by_name, o.owner_name),
  updated_by_name = coalesce(p.updated_by_name, o.owner_name)
from public.organizations o
where p.organization_id = o.id
  and o.owner_name is not null
  and (p.created_by_name is null or p.updated_by_name is null);

update public.product_tours t
set
  created_by_name = coalesce(t.created_by_name, o.owner_name),
  updated_by_name = coalesce(t.updated_by_name, o.owner_name)
from public.organizations o
where t.organization_id = o.id
  and o.owner_name is not null
  and (t.created_by_name is null or t.updated_by_name is null);

update public.share_links sl
set
  created_by_name = coalesce(sl.created_by_name, o.owner_name),
  updated_by_name = coalesce(sl.updated_by_name, o.owner_name)
from public.organizations o
where sl.organization_id = o.id
  and o.owner_name is not null
  and (sl.created_by_name is null or sl.updated_by_name is null);

update public.workflow_artifacts wa
set
  created_by_name = coalesce(wa.created_by_name, o.owner_name),
  updated_by_name = coalesce(wa.updated_by_name, o.owner_name)
from public.organizations o
where wa.organization_id = o.id
  and o.owner_name is not null
  and (wa.created_by_name is null or wa.updated_by_name is null);

create or replace function public.apply_row_audit()
returns trigger
language plpgsql
as $$
declare
  email text := public.current_user_email();
  display_name text := public.current_user_display_name();
begin
  if tg_op = 'INSERT' then
    if new.created_by is null or btrim(new.created_by) = '' then
      new.created_by := email;
    end if;
    if new.updated_by is null or btrim(new.updated_by) = '' then
      new.updated_by := coalesce(email, new.created_by);
    end if;
    if new.created_by_name is null or btrim(new.created_by_name) = '' then
      new.created_by_name := display_name;
    end if;
    if new.updated_by_name is null or btrim(new.updated_by_name) = '' then
      new.updated_by_name := coalesce(display_name, new.created_by_name);
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
  new.created_by_name := old.created_by_name;

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

  if display_name is not null then
    new.updated_by_name := display_name;
  elsif new.updated_by_name is null or btrim(new.updated_by_name) = '' then
    new.updated_by_name := old.updated_by_name;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

-- Shared document payload includes display names for clients.
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
    'createdByName', doc.created_by_name,
    'updatedByName', doc.updated_by_name,
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
    'updatedBy', tour.updated_by,
    'createdByName', tour.created_by_name,
    'updatedByName', tour.updated_by_name
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
    'updatedBy', persona.updated_by,
    'createdByName', persona.created_by_name,
    'updatedByName', persona.updated_by_name
  );
end;
$$;

grant execute on function public.current_user_display_name() to authenticated;
