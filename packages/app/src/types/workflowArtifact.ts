export const WORKFLOW_ARTIFACT_TYPES = {
  testCases: 'test_cases',
  playwright: 'playwright',
  flowMap: 'flow_map',
} as const;

export type WorkflowArtifactType =
  (typeof WORKFLOW_ARTIFACT_TYPES)[keyof typeof WORKFLOW_ARTIFACT_TYPES];

export interface WorkflowArtifactSummary {
  id: string;
  documentId: string;
  artifactType: WorkflowArtifactType;
  flowTitle: string;
  generatedAt: string;
  updatedAt: string;
}

export interface WorkflowArtifact extends WorkflowArtifactSummary {
  content: string;
}

export interface DocumentArtifactStatus {
  artifactType: WorkflowArtifactType;
  exists: boolean;
  artifactId?: string;
  updatedAt?: string;
}
