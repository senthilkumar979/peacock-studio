-- Align unique index empty-title handling with app normalizeFlowTitle ('Untitled flow').

DROP INDEX IF EXISTS public.flow_documents_org_title_version_uidx;

CREATE UNIQUE INDEX flow_documents_org_title_version_uidx
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
