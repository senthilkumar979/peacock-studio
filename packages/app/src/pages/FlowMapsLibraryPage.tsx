import { ArtifactLibraryPage } from '@/pages/artifacts/ArtifactLibraryPage';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

export const FlowMapsLibraryPage = () => (
  <ArtifactLibraryPage artifactType={WORKFLOW_ARTIFACT_TYPES.flowMap} />
);
