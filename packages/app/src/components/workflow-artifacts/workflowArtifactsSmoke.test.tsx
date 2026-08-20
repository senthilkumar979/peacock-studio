import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/hooks/useWorkflowArtifacts', () => ({
  useDocumentArtifactStatuses: () => ({
    statuses: [],
    isLoading: false,
    error: null,
    refresh: vi.fn(),
    generate: vi.fn(),
  }),
  useSaveFlowMapOverlay: () => ({
    saveOverlay: vi.fn(),
    isSaving: false,
  }),
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'cloud',
}));

vi.mock('@/utils/notify', () => ({
  notifyPromise: vi.fn((p: Promise<unknown>) => p),
  notifyError: vi.fn(),
}));

vi.mock('@/workflow-artifacts/FlowMapCanvas', () => ({
  FlowMapCanvas: () => <div data-testid="flow-map-canvas">Flow map canvas</div>,
}));

import { WORKFLOW_ARTIFACT_UI } from '@/constants/workflowArtifactUi';
import { WorkflowArtifactTiles } from './WorkflowArtifactTiles';
import { ArtifactContentView } from './ArtifactContentView';
import { ArtifactDetailToolbar } from './ArtifactDetailToolbar';

describe('workflow artifacts smoke', () => {
  it('WorkflowArtifactTiles heading', async () => {
    renderWithProviders(<WorkflowArtifactTiles documentId="doc-1" />);
    expect(await screen.findByText('Test cases')).toBeInTheDocument();
  });

  it('ArtifactContentView shows mermaid toggle for flow map', () => {
    renderWithProviders(
      <ArtifactContentView
        artifactType="flow_map"
        documentId="doc-1"
        flowTitle="Flow"
        content="graph TD; A-->B;"
      />,
    );
    expect(screen.getByText('View Mermaid source')).toBeInTheDocument();
  });

  it('ArtifactDetailToolbar shows download', () => {
    renderWithProviders(
      <ArtifactDetailToolbar
        artifact={{
          id: 'a1',
          documentId: 'doc-1',
          artifactType: 'test_cases',
          flowTitle: 'Flow',
          content: 'cases',
          generatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        config={WORKFLOW_ARTIFACT_UI.test_cases}
        isRegenerating={false}
        onRegenerate={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Copy test cases/i })).toBeInTheDocument();
  });
});
