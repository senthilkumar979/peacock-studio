import type { FlowOutlineItem, FlowPayload } from '@peacock/shared';
import { isoToMs, msToIso, stampAuditForCloudWrite } from '@/cloud/audit';
import { requireCloudAuthContext } from '@/cloud/authContext';
import {
  deleteDocumentScreenshots,
  resolveScreenshotUrls,
  syncDocumentScreenshots,
} from '@/cloud/screenshotStorage';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import type { FlowShareSettings, SavedFlowDocument, SavedFlowSummary } from '@/types/savedFlow';
import { countPlayableSteps } from '@/utils/flowDocumentSnapshot';

interface FlowDocumentRow {
  id: string;
  organization_id: string;
  saved_at: string | number;
  updated_at: string | number;
  created_at?: string | number;
  created_by?: string | null;
  updated_by?: string | null;
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  share_settings: FlowShareSettings | null;
}

export async function cloudListFlowSummaries(): Promise<SavedFlowSummary[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('flow_documents')
    .select('id, saved_at, updated_at, created_by, updated_by, flow, steps')
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
    .select('id, saved_at, updated_at, created_by, updated_by, flow, steps, share_settings')
    .eq('organization_id', organizationId)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  const screenshotUrls = await resolveScreenshotUrls(id);
  const row = data as FlowDocumentRow;

  return {
    id: row.id,
    savedAt: isoToMs(row.saved_at),
    updatedAt: isoToMs(row.updated_at),
    createdBy: row.created_by ?? null,
    updatedBy: row.updated_by ?? null,
    flow: row.flow as FlowPayload,
    steps: row.steps as FlowOutlineItem[],
    shareSettings: row.share_settings ?? undefined,
    screenshotUrls,
  };
}

export async function cloudSaveFlowDocument(
  doc: SavedFlowDocument,
  options: { preserveUpdatedAt?: boolean } = {},
): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
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

  const { error } = await supabase.from('flow_documents').upsert(
    {
      id: doc.id,
      organization_id: organizationId,
      saved_at: msToIso(audit.createdAt),
      created_at: msToIso(audit.createdAt),
      updated_at: msToIso(audit.updatedAt),
      created_by: audit.createdBy,
      updated_by: audit.updatedBy,
      flow: doc.flow,
      steps: doc.steps,
      share_settings: doc.shareSettings ?? null,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;

  await syncDocumentScreenshots(doc.id, doc.screenshotUrls);
}

export async function cloudDeleteFlowDocument(id: string): Promise<void> {
  await deleteDocumentScreenshots(id);

  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase
    .from('flow_documents')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', id);

  if (error) throw error;
}

function toFlowSummary(row: FlowDocumentRow): SavedFlowSummary {
  const flow = row.flow;
  const title = flow.flow.title.trim() || 'Untitled flow';

  return {
    id: row.id,
    title,
    description: flow.flow.description.trim(),
    version: flow.flow.version?.trim() ?? '',
    generatedAt: flow.metadata.createdAt,
    updatedAt: isoToMs(row.updated_at),
    createdBy: row.created_by ?? null,
    updatedBy: row.updated_by ?? null,
    stepCount: countPlayableSteps(row.steps),
  };
}
