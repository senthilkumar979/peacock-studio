-- Upserts fire BEFORE INSERT even when the row already exists (ON CONFLICT UPDATE).
-- Skip quota when updating an existing document id so status/edits never hit the limit.

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
  if exists (
    select 1
    from public.flow_documents
    where id = new.id
  ) then
    return new;
  end if;

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
