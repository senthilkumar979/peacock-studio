-- Step resources linked to flow documents and steps.
-- flow_documents.id is text (client-generated UUID strings), not uuid.
-- Idempotent: safe to re-run after partial apply or in SQL editor.

create table if not exists public.step_resources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id text not null references public.flow_documents(id) on delete cascade,
  step_id text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists step_resources_document_id_idx on public.step_resources (document_id);
create index if not exists step_resources_step_id_idx on public.step_resources (step_id);
create index if not exists step_resources_organization_id_idx on public.step_resources (organization_id);

alter table public.step_resources enable row level security;

-- Legacy policy name from an earlier draft (wrong memberships table).
drop policy if exists step_resources_org_member_all on public.step_resources;

drop policy if exists step_resources_select_member on public.step_resources;
create policy step_resources_select_member on public.step_resources
  for select
  using (organization_id in (select user_organization_ids()));

drop policy if exists step_resources_insert_create on public.step_resources;
create policy step_resources_insert_create on public.step_resources
  for insert
  with check (
    organization_id in (select user_organization_ids())
    and (is_org_admin(organization_id) or member_has_capability(organization_id, 'create'))
  );

drop policy if exists step_resources_update_edit on public.step_resources;
create policy step_resources_update_edit on public.step_resources
  for update
  using (
    organization_id in (select user_organization_ids())
    and (is_org_admin(organization_id) or member_has_capability(organization_id, 'edit'))
  )
  with check (
    organization_id in (select user_organization_ids())
    and (is_org_admin(organization_id) or member_has_capability(organization_id, 'edit'))
  );

drop policy if exists step_resources_delete_delete on public.step_resources;
create policy step_resources_delete_delete on public.step_resources
  for delete
  using (
    organization_id in (select user_organization_ids())
    and (is_org_admin(organization_id) or member_has_capability(organization_id, 'delete'))
  );
