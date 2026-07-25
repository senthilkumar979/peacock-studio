-- Harden screenshots bucket MIME allowlist and enforce org storage/doc quotas in Postgres.

-- ---------------------------------------------------------------------------
-- Bucket: 1 MB + JPEG/PNG only (SVG never stored in cloud)
-- ---------------------------------------------------------------------------
update storage.buckets
set
  file_size_limit = 1048576,
  allowed_mime_types = array['image/jpeg', 'image/png']::text[]
where id = 'screenshots';

-- ---------------------------------------------------------------------------
-- Org quota columns (null limit = unlimited / paid)
-- Defaults match free-tier UX: 10 docs, 100 MB storage
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists storage_bytes_limit bigint,
  add column if not exists doc_limit integer;

update public.organizations
set
  storage_bytes_limit = coalesce(storage_bytes_limit, 104857600),
  doc_limit = coalesce(doc_limit, 10)
where storage_bytes_limit is null
   or doc_limit is null;

alter table public.organizations
  alter column storage_bytes_limit set default 104857600,
  alter column doc_limit set default 10;

-- ---------------------------------------------------------------------------
-- screenshot_assets: enforce storage quota + keep storage_bytes in sync
-- ---------------------------------------------------------------------------
create or replace function public.enforce_screenshot_asset_storage_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org record;
  next_bytes bigint;
  path_already_counted boolean;
  row_already_exists boolean;
begin
  -- Upserts fire BEFORE INSERT before ON CONFLICT switches to UPDATE.
  select exists (
    select 1
    from public.screenshot_assets
    where organization_id = new.organization_id
      and document_id = new.document_id
      and id = new.id
  ) into row_already_exists;

  if row_already_exists then
    return new;
  end if;

  select exists (
    select 1
    from public.screenshot_assets
    where organization_id = new.organization_id
      and storage_path = new.storage_path
  ) into path_already_counted;

  -- Deduped assets that reuse an existing storage object do not consume more quota.
  if path_already_counted then
    return new;
  end if;

  select id, storage_bytes, storage_bytes_limit
    into org
  from public.organizations
  where id = new.organization_id
  for update;

  if org.id is null then
    raise exception 'Organization not found';
  end if;

  next_bytes := coalesce(org.storage_bytes, 0) + coalesce(new.byte_size, 0);

  if org.storage_bytes_limit is not null
     and next_bytes > org.storage_bytes_limit then
    raise exception 'Storage quota exceeded for this workspace';
  end if;

  update public.organizations
  set
    storage_bytes = next_bytes,
    updated_at = now()
  where id = org.id;

  return new;
end;
$$;

create or replace function public.reclaim_screenshot_asset_storage_bytes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  still_referenced boolean;
begin
  select exists (
    select 1
    from public.screenshot_assets
    where organization_id = old.organization_id
      and storage_path = old.storage_path
  ) into still_referenced;

  if still_referenced then
    return old;
  end if;

  update public.organizations
  set
    storage_bytes = greatest(0, coalesce(storage_bytes, 0) - coalesce(old.byte_size, 0)),
    updated_at = now()
  where id = old.organization_id;

  return old;
end;
$$;

drop trigger if exists screenshot_assets_enforce_storage_quota on public.screenshot_assets;
create trigger screenshot_assets_enforce_storage_quota
  before insert on public.screenshot_assets
  for each row
  execute function public.enforce_screenshot_asset_storage_quota();

drop trigger if exists screenshot_assets_reclaim_storage_bytes on public.screenshot_assets;
create trigger screenshot_assets_reclaim_storage_bytes
  after delete on public.screenshot_assets
  for each row
  execute function public.reclaim_screenshot_asset_storage_bytes();

-- ---------------------------------------------------------------------------
-- flow_documents: enforce doc_limit
-- ---------------------------------------------------------------------------
create or replace function public.enforce_flow_document_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_doc_limit integer;
  doc_count integer;
begin
  select doc_limit into org_doc_limit
  from public.organizations
  where id = new.organization_id;

  if org_doc_limit is null then
    return new;
  end if;

  select count(*)::integer into doc_count
  from public.flow_documents
  where organization_id = new.organization_id;

  if doc_count >= org_doc_limit then
    raise exception 'Document limit reached for this workspace';
  end if;

  return new;
end;
$$;

drop trigger if exists flow_documents_enforce_doc_quota on public.flow_documents;
create trigger flow_documents_enforce_doc_quota
  before insert on public.flow_documents
  for each row
  execute function public.enforce_flow_document_quota();
