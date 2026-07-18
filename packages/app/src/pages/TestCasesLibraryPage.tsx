import { ArtifactLibraryPage } from '@/pages/artifacts/ArtifactLibraryPage';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

export const TestCasesLibraryPage = () => (
  <ArtifactLibraryPage artifactType={WORKFLOW_ARTIFACT_TYPES.testCases} />
);
