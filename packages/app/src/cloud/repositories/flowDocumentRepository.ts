import type { FlowOutlineItem, FlowPayload } from '@peacock/shared';
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
  saved_at: number;
  updated_at: number;
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  share_settings: FlowShareSettings | null;
}

export async function cloudListFlowSummaries(): Promise<SavedFlowSummary[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('flow_documents')
    .select('id, saved_at, updated_at, flow, steps')
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
    .select('id, saved_at, updated_at, flow, steps, share_settings')
    .eq('organization_id', organizationId)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  const screenshotUrls = await resolveScreenshotUrls(id);

  return {
    id: data.id,
    savedAt: Number(data.saved_at),
    updatedAt: Number(data.updated_at),
    flow: data.flow as FlowPayload,
    steps: data.steps as FlowOutlineItem[],
    shareSettings: (data.share_settings as FlowShareSettings | null) ?? undefined,
    screenshotUrls,
  };
}

export async function cloudSaveFlowDocument(doc: SavedFlowDocument): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase.from('flow_documents').upsert(
    {
      id: doc.id,
      organization_id: organizationId,
      saved_at: doc.savedAt,
      updated_at: doc.updatedAt,
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
    updatedAt: Number(row.updated_at),
    stepCount: countPlayableSteps(row.steps),
  };
}
