import { ArtifactDetailPage } from '@/pages/artifacts/ArtifactDetailPage';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

export const FlowMapsDetailPage = () => (
  <ArtifactDetailPage artifactType={WORKFLOW_ARTIFACT_TYPES.flowMap} />
);
