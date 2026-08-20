import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from '../test/pageTestUtils';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ documentId: 'doc-1' }) };
});

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'cloud',
}));

vi.mock('@/hooks/useWorkflowArtifacts', () => ({
  useWorkflowArtifactDetail: () => ({
    artifact: {
      id: 'a1',
      documentId: 'doc-1',
      flowTitle: 'Checkout flow',
      content: '# cases',
      updatedAt: Date.now(),
      metadata: null,
    },
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/components/AppHeader', () => ({
  AppHeader: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {children}
    </header>
  ),
}));

vi.mock('@/components/AppFooter', () => ({ AppFooter: () => <footer>footer</footer> }));

vi.mock('@/components/workflow-artifacts/ArtifactDetailToolbar', () => ({
  ArtifactDetailToolbar: () => <div>toolbar</div>,
}));

vi.mock('@/components/workflow-artifacts/ArtifactContentView', () => ({
  ArtifactContentView: () => <div>artifact content</div>,
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyPromise: vi.fn((p) => p),
  notifySuccess: vi.fn(),
}));

vi.mock('@/analytics/analyticsClient', () => ({ trackEvent: vi.fn() }));
vi.mock('@/services/workflowArtifactService', () => ({
  generateWorkflowArtifact: vi.fn(),
}));
vi.mock('@/utils/downloadTextFile', () => ({ downloadTextFile: vi.fn() }));

import { ArtifactDetailPage } from './ArtifactDetailPage';

describe('ArtifactDetailPage', () => {
  it('renders artifact title and content', () => {
    renderAtRoute('/artifacts/doc-1', (
      <ArtifactDetailPage artifactType={WORKFLOW_ARTIFACT_TYPES.testCases} />
    ));
    expect(screen.getByRole('heading', { name: /checkout flow/i })).toBeInTheDocument();
    expect(screen.getByText('toolbar')).toBeInTheDocument();
    expect(screen.getByText('artifact content')).toBeInTheDocument();
  });
});
