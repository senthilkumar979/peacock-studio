import { ArtifactDetailPage } from '@/pages/artifacts/ArtifactDetailPage';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

export const TestCasesDetailPage = () => (
  <ArtifactDetailPage artifactType={WORKFLOW_ARTIFACT_TYPES.testCases} />
);
