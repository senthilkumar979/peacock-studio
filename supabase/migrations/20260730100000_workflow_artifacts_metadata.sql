-- Optional presentation overlay for workflow artifacts (flow_map layout, statuses, notes).
alter table public.workflow_artifacts
  add column if not exists metadata jsonb;

comment on column public.workflow_artifacts.metadata is
  'Artifact-specific overlay JSON. flow_map: layout positions, review statuses, sticky notes.';
