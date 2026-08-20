import type { FlowOutlineItem, FlowPayload } from '@peacock/shared';
import { countStepDomains } from '@peacock/shared';
import { isoToMs, msToIso, requireUserEmail, stampAuditForCloudWrite } from '@/cloud/audit';
import { requireCapability, requireCloudAuthContext } from '@/cloud/authContext';
import {
  deleteDocumentScreenshots,
  pruneDocumentScreenshots,
  resolveScreenshotUrls,
  syncDocumentScreenshots,
} from '@/cloud/screenshotStorage';
import {
  deleteResourcesForDocument,
  fetchDocumentResources,
  syncDocumentResources,
} from '@/cloud/repositories/stepResourceRepository';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import type {
  FlowDocumentStatus,
  FlowShareSettings,
  SavedFlowDocument,
  SavedFlowSummary,
} from '@/types/savedFlow';
import { countPlayableSteps } from '@/utils/flowDocumentSnapshot';
import {
  normalizeFlowStatus,
  normalizeFlowVersion,
  titleVersionIdentity,
  TitleVersionConflictError,
} from '@/utils/flowDocumentMeta';

interface FlowDocumentRow {
  id: string;
  organization_id: string;
  saved_at: string | number;
  updated_at: string | number;
  created_at?: string | number;
  created_by?: string | null;
  updated_by?: string | null;
  status?: FlowDocumentStatus | null;
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  share_settings: FlowShareSettings | null;
}

export async function cloudListFlowSummaries(): Promise<SavedFlowSummary[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('flow_documents')
    .select('id, saved_at, updated_at, created_by, updated_by, status, flow, steps')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => toFlowSummary(row as FlowDocumentRow));
}

export async function cloudGetFlowDocument(id: string): Promise<SavedFlowDocument | undefined> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('flow_documents')
    .select('id, saved_at, updated_at, created_by, updated_by, status, flow, steps, share_settings')
    .eq('organization_id', organizationId)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  const screenshotUrls = await resolveScreenshotUrls(id);
  const stepResources = await fetchDocumentResources(id);
  const row = data as FlowDocumentRow;

  return {
    id: row.id,
    savedAt: isoToMs(row.saved_at),
    updatedAt: isoToMs(row.updated_at),
    status: normalizeFlowStatus(row.status, 'live'),
    createdBy: row.created_by ?? null,
    updatedBy: row.updated_by ?? null,
    flow: normalizeFlowPayload(row.flow as FlowPayload),
    steps: row.steps as FlowOutlineItem[],
    shareSettings: row.share_settings ?? undefined,
    screenshotUrls,
    stepResources,
  };
}

export async function cloudFindTitleVersionConflict(input: {
  title: string;
  version: string;
  excludeDocumentId?: string;
  excludeDocumentIds?: string[];
}): Promise<{ id: string; title: string; version: string } | null> {
  const { organizationId } = requireCloudAuthContext();
  const identity = titleVersionIdentity(input.title, input.version);
  const excluded = new Set(
    [...(input.excludeDocumentIds ?? []), input.excludeDocumentId].filter(
      (id): id is string => Boolean(id),
    ),
  );
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('flow_documents')
    .select('id, flow')
    .eq('organization_id', organizationId);

  if (error) throw error;

  for (const row of data ?? []) {
    if (excluded.has(row.id)) continue;
    const flow = row.flow as FlowPayload | null;
    const other = titleVersionIdentity(flow?.flow?.title, flow?.flow?.version);
    if (other.titleKey === identity.titleKey && other.versionKey === identity.versionKey) {
      return { id: row.id, title: identity.title, version: identity.version };
    }
  }

  return null;
}

export async function cloudSaveFlowDocument(
  doc: SavedFlowDocument,
  options: { preserveUpdatedAt?: boolean } = {},
): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabaseCheck = getAuthenticatedSupabaseClient();
  const { data: existingRow, error: existingError } = await supabaseCheck
    .from('flow_documents')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('id', doc.id)
    .maybeSingle();
  if (existingError) throw existingError;

  requireCapability(existingRow ? 'edit' : 'create');

  const conflict = await cloudFindTitleVersionConflict({
    title: doc.flow.flow.title,
    version: doc.flow.flow.version,
    excludeDocumentId: doc.id,
  });
  if (conflict) {
    throw new TitleVersionConflictError({
      conflictDocumentId: conflict.id,
      title: conflict.title,
      version: conflict.version,
    });
  }

  const supabase = getAuthenticatedSupabaseClient();
  const audit = stampAuditForCloudWrite(
    {
      createdAt: doc.savedAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
    },
    options,
  );

  const flow = normalizeFlowPayload(doc.flow);
  const row = {
    id: doc.id,
    organization_id: organizationId,
    saved_at: msToIso(audit.createdAt),
    created_at: msToIso(audit.createdAt),
    updated_at: msToIso(audit.updatedAt),
    created_by: audit.createdBy,
    updated_by: audit.updatedBy,
    status: normalizeFlowStatus(doc.status, 'draft'),
    flow,
    steps: doc.steps,
    share_settings: doc.shareSettings ?? null,
    domain_counts: countStepDomains(doc.steps),
  };

  // Upsert (POST) instead of update (PATCH) — some networks block PATCH on Supabase preflight.
  const { error } = await supabase.from('flow_documents').upsert(row, { onConflict: 'id' });
  if (error) throw error;

  await syncDocumentScreenshots(doc.id, doc.screenshotUrls);
  await pruneDocumentScreenshots(doc.id, doc.steps);
  await syncDocumentResources(doc.id, doc.stepResources ?? []);
}

/** Status-only write — never inserts, so it cannot hit the document quota. */
export async function cloudUpdateFlowDocumentStatus(
  documentId: string,
  status: FlowDocumentStatus,
): Promise<void> {
  requireCapability('edit');
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();
  const updatedBy = requireUserEmail();

  // Avoid PATCH/CORS issues by upserting (POST), but `flow_documents` has NOT NULL
  // columns. So we first fetch the current row and then upsert all required fields.
  const { data: existingRow, error: existingError } = await supabase
    .from('flow_documents')
    .select(
      'id, saved_at, updated_at, created_at, created_by, flow, steps, domain_counts, share_settings',
    )
    .eq('organization_id', organizationId)
    .eq('id', documentId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existingRow) throw new Error('Documentation not found.');

  const savedAt = resolveFlowDocumentTimestamp(
    existingRow.saved_at,
    existingRow.updated_at,
    existingRow.created_at,
  );
  const createdAt = resolveFlowDocumentTimestamp(
    existingRow.created_at,
    existingRow.saved_at,
    existingRow.updated_at,
  );

  const row = {
    id: existingRow.id,
    organization_id: organizationId,
    saved_at: savedAt,
    created_at: createdAt,
    created_by: existingRow.created_by ?? updatedBy,
    updated_at: msToIso(Date.now()),
    updated_by: updatedBy,
    status: normalizeFlowStatus(status, 'draft'),
    flow: normalizeFlowPayload(existingRow.flow as FlowPayload),
    steps: existingRow.steps as FlowOutlineItem[],
    share_settings: existingRow.share_settings ?? null,
    domain_counts: existingRow.domain_counts,
  };

  const { error } = await supabase
    .from('flow_documents')
    .upsert(row, { onConflict: 'id' })
    .select('id')
    .maybeSingle();

  if (error) throw error;
}

export async function cloudDeleteFlowDocument(id: string): Promise<void> {
  requireCapability('delete');
  await deleteDocumentScreenshots(id);
  await deleteResourcesForDocument(id);

  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase
    .from('flow_documents')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', id);

  if (error) throw error;
}

function resolveFlowDocumentTimestamp(
  ...candidates: Array<string | number | null | undefined>
): string {
  for (const value of candidates) {
    if (value != null && value !== '') return msToIso(isoToMs(value));
  }
  return msToIso(Date.now());
}

function normalizeFlowPayload(flow: FlowPayload): FlowPayload {
  return {
    ...flow,
    flow: {
      ...flow.flow,
      title: flow.flow.title.trim() || 'Untitled flow',
      version: normalizeFlowVersion(flow.flow.version),
    },
  };
}

function toFlowSummary(row: FlowDocumentRow): SavedFlowSummary {
  const flow = row.flow;
  const title = flow.flow.title.trim() || 'Untitled flow';

  return {
    id: row.id,
    title,
    description: flow.flow.description.trim(),
    version: normalizeFlowVersion(flow.flow.version),
    status: normalizeFlowStatus(row.status, 'live'),
    generatedAt: flow.metadata.createdAt,
    updatedAt: isoToMs(row.updated_at),
    createdBy: row.created_by ?? null,
    updatedBy: row.updated_by ?? null,
    stepCount: countPlayableSteps(row.steps),
  };
}
