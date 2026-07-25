-- Flow document publish status (draft | live). Legacy rows default to live.

alter table public.flow_documents
  add column if not exists status text not null default 'live';

alter table public.flow_documents
  drop constraint if exists flow_documents_status_check;

alter table public.flow_documents
  add constraint flow_documents_status_check
  check (status in ('draft', 'live'));

comment on column public.flow_documents.status is
  'Publish lifecycle: draft cannot be resolved via public share links.';

-- Block public share resolution for draft flow documents.
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

  if not public.share_link_caller_authorized(link) then
    return jsonb_build_object(
      'requiresAuth', true,
      'token', link.token
    );
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

  if coalesce(doc.status, 'live') <> 'live' then
    return null;
  end if;

  return jsonb_build_object(
    'id', doc.id,
    'savedAt', doc.saved_at,
    'updatedAt', doc.updated_at,
    'createdBy', doc.created_by,
    'updatedBy', doc.updated_by,
    'status', coalesce(doc.status, 'live'),
    'flow', doc.flow,
    'steps', doc.steps,
    'shareSettings', doc.share_settings
  );
end;
$$;
