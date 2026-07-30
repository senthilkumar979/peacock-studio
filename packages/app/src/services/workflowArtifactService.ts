import {
  buildWorkflowGraph,
  generateFlowMapMarkdown,
  generatePlaywrightSpec,
  generateTestCasesMarkdown,
  pruneFlowMapOverlay,
  type FlowMapOverlay,
} from '@peacock/shared';
import { isCloudLibraryActive } from '@/cloud/authContext';
import {
  cloudGetWorkflowArtifact,
  cloudListDocumentArtifactStatuses,
  cloudListWorkflowArtifacts,
  cloudPatchWorkflowArtifactMetadata,
  cloudSaveWorkflowArtifact,
} from '@/cloud/repositories/workflowArtifactRepository';
import { cloudSaveFlowDocument } from '@/cloud/repositories/flowDocumentRepository';
import { getFlowDocument } from '@/services/flowLibraryService';
import type {
  WorkflowArtifact,
  WorkflowArtifactSummary,
  WorkflowArtifactType,
} from '@/types/workflowArtifact';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

function requireCloudArtifactsEnabled(): void {
  if (!isCloudLibraryActive()) {
    throw new Error('Sign in with cloud sync to generate and store workflow artifacts.');
  }
}

function generateContent(
  artifactType: WorkflowArtifactType,
  flowTitle: string,
  steps: import('@peacock/shared').FlowOutlineItem[],
): string {
  switch (artifactType) {
    case WORKFLOW_ARTIFACT_TYPES.testCases:
      return generateTestCasesMarkdown(flowTitle, steps);
    case WORKFLOW_ARTIFACT_TYPES.playwright:
      return generatePlaywrightSpec(flowTitle, steps);
    case WORKFLOW_ARTIFACT_TYPES.flowMap:
      return generateFlowMapMarkdown(flowTitle, steps);
    default:
      throw new Error('Unsupported artifact type.');
  }
}

export async function listWorkflowArtifacts(
  artifactType: WorkflowArtifactType,
): Promise<WorkflowArtifactSummary[]> {
  requireCloudArtifactsEnabled();
  return cloudListWorkflowArtifacts(artifactType);
}

export async function getWorkflowArtifact(
  documentId: string,
  artifactType: WorkflowArtifactType,
): Promise<WorkflowArtifact | undefined> {
  requireCloudArtifactsEnabled();
  return cloudGetWorkflowArtifact(documentId, artifactType);
}

export async function listDocumentArtifactStatuses(
  documentId: string,
): Promise<WorkflowArtifactSummary[]> {
  requireCloudArtifactsEnabled();
  return cloudListDocumentArtifactStatuses(documentId);
}

export async function saveFlowMapOverlay(
  documentId: string,
  overlay: FlowMapOverlay,
): Promise<WorkflowArtifact> {
  requireCloudArtifactsEnabled();
  return cloudPatchWorkflowArtifactMetadata(
    documentId,
    WORKFLOW_ARTIFACT_TYPES.flowMap,
    overlay,
  );
}

export async function generateWorkflowArtifact(
  documentId: string,
  artifactType: WorkflowArtifactType,
): Promise<WorkflowArtifact> {
  requireCloudArtifactsEnabled();

  const doc = await getFlowDocument(documentId);
  if (!doc) {
    throw new Error('Flow document not found.');
  }

  const existing =
    artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap
      ? await cloudGetWorkflowArtifact(documentId, artifactType)
      : undefined;

  await cloudSaveFlowDocument(doc);

  const flowTitle = doc.flow.flow.title.trim() || 'Untitled flow';
  const content = generateContent(artifactType, flowTitle, doc.steps);

  const artifact = await cloudSaveWorkflowArtifact({
    documentId,
    artifactType,
    flowTitle,
    content,
  });

  if (artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap && existing?.metadata) {
    const graph = buildWorkflowGraph(flowTitle, doc.steps);
    const pruned = pruneFlowMapOverlay(existing.metadata, graph);
    return cloudPatchWorkflowArtifactMetadata(
      documentId,
      WORKFLOW_ARTIFACT_TYPES.flowMap,
      pruned,
    );
  }

  return artifact;
}
