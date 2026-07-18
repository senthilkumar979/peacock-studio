-- On-demand workflow artifacts (test cases, Playwright specs, flow maps)

create table if not exists public.workflow_artifacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_id text not null references public.flow_documents (id) on delete cascade,
  artifact_type text not null check (artifact_type in ('test_cases', 'playwright', 'flow_map')),
  flow_title text not null default '',
  content text not null,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, document_id, artifact_type)
);

create index if not exists workflow_artifacts_org_type_idx
  on public.workflow_artifacts (organization_id, artifact_type, updated_at desc);

create index if not exists workflow_artifacts_document_idx
  on public.workflow_artifacts (organization_id, document_id);

alter table public.workflow_artifacts enable row level security;

create policy "workflow_artifacts_all_own_org"
  on public.workflow_artifacts for all
  using (organization_id in (select public.user_organization_ids()))
  with check (organization_id in (select public.user_organization_ids()));
