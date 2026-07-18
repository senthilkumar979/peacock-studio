import { ArtifactDetailPage } from '@/pages/artifacts/ArtifactDetailPage';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

export const PlaywrightTestsDetailPage = () => (
  <ArtifactDetailPage artifactType={WORKFLOW_ARTIFACT_TYPES.playwright} />
);
