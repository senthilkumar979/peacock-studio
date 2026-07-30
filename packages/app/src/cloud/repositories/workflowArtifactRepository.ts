import { parseFlowMapOverlay, type FlowMapOverlay } from '@peacock/shared';
import { requireCloudAuthContext } from '@/cloud/authContext';
import { recordOrgEvent } from '@/cloud/repositories/analyticsRepository';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import type {
  WorkflowArtifact,
  WorkflowArtifactSummary,
  WorkflowArtifactType,
} from '@/types/workflowArtifact';

interface WorkflowArtifactRow {
  id: string;
  document_id: string;
  artifact_type: WorkflowArtifactType;
  flow_title: string;
  content: string;
  metadata?: unknown;
  generated_at: string;
  updated_at: string;
}

const ARTIFACT_SELECT =
  'id, document_id, artifact_type, flow_title, content, metadata, generated_at, updated_at';

function toSummary(row: WorkflowArtifactRow): WorkflowArtifactSummary {
  return {
    id: row.id,
    documentId: row.document_id,
    artifactType: row.artifact_type,
    flowTitle: row.flow_title,
    generatedAt: row.generated_at,
    updatedAt: row.updated_at,
  };
}

function toArtifact(row: WorkflowArtifactRow): WorkflowArtifact {
  return {
    ...toSummary(row),
    content: row.content,
    metadata: parseFlowMapOverlay(row.metadata),
  };
}

export async function cloudListWorkflowArtifacts(
  artifactType: WorkflowArtifactType,
): Promise<WorkflowArtifactSummary[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('workflow_artifacts')
    .select('id, document_id, artifact_type, flow_title, generated_at, updated_at')
    .eq('organization_id', organizationId)
    .eq('artifact_type', artifactType)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => toSummary(row as WorkflowArtifactRow));
}

export async function cloudGetWorkflowArtifact(
  documentId: string,
  artifactType: WorkflowArtifactType,
): Promise<WorkflowArtifact | undefined> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('workflow_artifacts')
    .select(ARTIFACT_SELECT)
    .eq('organization_id', organizationId)
    .eq('document_id', documentId)
    .eq('artifact_type', artifactType)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;
  return toArtifact(data as WorkflowArtifactRow);
}

export async function cloudListDocumentArtifactStatuses(
  documentId: string,
): Promise<WorkflowArtifactSummary[]> {
  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error } = await supabase
    .from('workflow_artifacts')
    .select('id, document_id, artifact_type, flow_title, generated_at, updated_at')
    .eq('organization_id', organizationId)
    .eq('document_id', documentId);

  if (error) throw error;
  return (data ?? []).map((row) => toSummary(row as WorkflowArtifactRow));
}

export async function cloudSaveWorkflowArtifact(input: {
  documentId: string;
  artifactType: WorkflowArtifactType;
  flowTitle: string;
  content: string;
}): Promise<WorkflowArtifact> {
  const { organizationId, userEmail } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('workflow_artifacts')
    .upsert(
      {
        organization_id: organizationId,
        document_id: input.documentId,
        artifact_type: input.artifactType,
        flow_title: input.flowTitle,
        content: input.content,
        generated_at: now,
        created_at: now,
        updated_at: now,
        created_by: userEmail,
        updated_by: userEmail,
      },
      { onConflict: 'organization_id,document_id,artifact_type' },
    )
    .select(ARTIFACT_SELECT)
    .single();

  if (error) throw error;

  void recordOrgEvent('artifact_export', {
    resourceType: 'document',
    resourceId: input.documentId,
    metadata: { artifactType: input.artifactType },
  });

  return toArtifact(data as WorkflowArtifactRow);
}

export async function cloudPatchWorkflowArtifactMetadata(
  documentId: string,
  artifactType: WorkflowArtifactType,
  metadata: FlowMapOverlay,
): Promise<WorkflowArtifact> {
  const { organizationId, userEmail } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('workflow_artifacts')
    .update({
      metadata,
      updated_at: now,
      updated_by: userEmail,
    })
    .eq('organization_id', organizationId)
    .eq('document_id', documentId)
    .eq('artifact_type', artifactType)
    .select(ARTIFACT_SELECT)
    .single();

  if (error) throw error;
  return toArtifact(data as WorkflowArtifactRow);
}
