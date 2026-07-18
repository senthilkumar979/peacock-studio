import { extractFlowMapMermaidSource } from '@peacock/shared';
import {
  WORKFLOW_ARTIFACT_TYPES,
  type WorkflowArtifactType,
} from '@/types/workflowArtifact';

export function getArtifactCopyContent(
  artifactType: WorkflowArtifactType,
  content: string,
): string {
  if (artifactType === WORKFLOW_ARTIFACT_TYPES.flowMap) {
    return extractFlowMapMermaidSource(content);
  }

  return content;
}
