import type { StepResource } from '@peacock/shared';
import { isoToMs, msToIso } from '@/cloud/audit';
import { requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

interface StepResourceRow {
  id: string;
  organization_id: string;
  document_id: string;
  step_id: string;
  url: string;
  label: string | null;
  sort_order: number;
  created_at: string;
}

function toStepResource(row: StepResourceRow): StepResource {
  const label = row.label?.trim();
  return {
    id: row.id,
    documentId: row.document_id,
    stepId: row.step_id,
    url: row.url,
    ...(label ? { label } : {}),
    sortOrder: row.sort_order,
    createdAt: isoToMs(row.created_at),
  };
}

export async function fetchDocumentResources(documentId: string): Promise<StepResource[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('step_resources')
    .select('id, organization_id, document_id, step_id, url, label, sort_order, created_at')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toStepResource(row as StepResourceRow));
}

export async function syncDocumentResources(
  documentId: string,
  resources: StepResource[],
): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data: existing, error: listError } = await supabase
    .from('step_resources')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (listError) throw listError;

  const existingIds = new Set((existing ?? []).map((row) => row.id));
  const nextIds = new Set(resources.map((resource) => resource.id));
  const toDelete = [...existingIds].filter((id) => !nextIds.has(id));

  if (toDelete.length) {
    const { error: deleteError } = await supabase
      .from('step_resources')
      .delete()
      .eq('organization_id', organizationId)
      .eq('document_id', documentId)
      .in('id', toDelete);
    if (deleteError) throw deleteError;
  }

  if (!resources.length) return;

  const rows = resources.map((resource) => ({
    id: resource.id,
    organization_id: organizationId,
    document_id: documentId,
    step_id: resource.stepId,
    url: resource.url,
    label: resource.label?.trim() || null,
    sort_order: resource.sortOrder,
    created_at: msToIso(resource.createdAt),
  }));

  const { error: upsertError } = await supabase
    .from('step_resources')
    .upsert(rows, { onConflict: 'id' });

  if (upsertError) throw upsertError;
}

export async function deleteResourcesForDocument(documentId: string): Promise<void> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { error } = await supabase
    .from('step_resources')
    .delete()
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (error) throw error;
}
