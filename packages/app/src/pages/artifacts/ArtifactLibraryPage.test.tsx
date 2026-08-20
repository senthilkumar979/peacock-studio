import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/pageTestUtils';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'guest',
}));

vi.mock('@/hooks/useWorkflowArtifacts', () => ({
  useWorkflowArtifactLibrary: () => ({
    artifacts: [],
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLibraryGuidePanel', () => ({
  useLibraryGuidePanel: () => ({
    showGuide: false,
    showGuideToggle: false,
    isGuideOpen: false,
    toggleGuide: vi.fn(),
  }),
}));

vi.mock('@/components/auth/CloudAuthActions', () => ({
  CloudAuthActions: ({ title }: { title?: string }) => <div>auth:{title}</div>,
}));

vi.mock('@/components/motion/SmoothLoadReveal', () => ({
  SmoothLoadReveal: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

import { ArtifactLibraryPage } from './ArtifactLibraryPage';

describe('ArtifactLibraryPage', () => {
  it('renders plural title and guest auth callout', () => {
    renderWithRouter(
      <ArtifactLibraryPage artifactType={WORKFLOW_ARTIFACT_TYPES.flowMap} />,
    );
    expect(screen.getByRole('heading', { name: /flow maps/i })).toBeInTheDocument();
    expect(screen.getByText(/auth:Flow maps/i)).toBeInTheDocument();
  });
});
