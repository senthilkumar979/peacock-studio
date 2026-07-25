-- Enforce unique (title, version) per organization (case-insensitive).
-- Empty title → 'Untitled flow'; empty version → '1.0.0' (matches app normalize helpers).

CREATE UNIQUE INDEX IF NOT EXISTS flow_documents_org_title_version_uidx
ON public.flow_documents (
  organization_id,
  lower(
    trim(
      coalesce(
        nullif(trim(coalesce(flow->'flow'->>'title', '')), ''),
        'Untitled flow'
      )
    )
  ),
  lower(
    trim(
      coalesce(
        nullif(trim(coalesce(flow->'flow'->>'version', '')), ''),
        '1.0.0'
      )
    )
  )
);
