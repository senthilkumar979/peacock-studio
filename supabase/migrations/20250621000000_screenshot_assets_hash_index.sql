-- Allow the same screenshot bytes (content_hash) to appear in multiple steps/documents.
-- Storage is still deduplicated in app code via shared storage_path; only the PK is unique per step.

drop index if exists public.screenshot_assets_org_hash_uidx;

create index if not exists screenshot_assets_org_hash_idx
  on public.screenshot_assets (organization_id, content_hash);

create index if not exists screenshot_assets_org_storage_path_idx
  on public.screenshot_assets (organization_id, storage_path);
