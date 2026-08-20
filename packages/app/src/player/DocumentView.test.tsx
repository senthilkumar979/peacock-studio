import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const step = {
  id: 'step-1',
  title: 'Open app',
  notes: '',
  generatedTitle: 'Open app',
  generatedDescription: 'Launch',
  screenshotId: '',
  event: { type: 'click', timestamp: 0 } as never,
};

const flowState = {
  flow: {
    flow: { title: 'Doc Flow', description: '<p>Desc</p>', version: '1.0.0', tags: [] },
    metadata: { createdAt: 1, captureEnvironment: null },
  },
  screenshotUrls: {},
  stepResources: [],
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: typeof flowState) => unknown) => selector(flowState),
  useViewerOutline: () => [step],
}));

vi.mock('@/hooks/useDocumentBranchPaths', () => ({
  useDocumentBranchPaths: () => ({
    selectedPathByBranchId: {},
    linkedContentByPathId: {},
    loadingPathIds: new Set(),
    errorsByPathId: {},
    selectPath: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDocumentGuideProgress', () => ({
  useDocumentGuideProgress: () => ({
    viewedStepIds: new Set(),
    markStepViewed: vi.fn(),
    isComplete: false,
    viewedCount: 0,
    totalCount: 1,
  }),
}));

vi.mock('@/hooks/useDocumentOutlineScrollSpy', () => ({
  scrollDocumentPaneToAnchor: vi.fn(),
  useDocumentOutlineScrollSpy: () => ({ activeItemId: null }),
  useDocumentWindowOutlineScrollSpy: () => ({ activeItemId: null }),
}));

vi.mock('@/hooks/useDocumentHashNavigation', () => ({
  useDocumentHashNavigation: vi.fn(),
}));

vi.mock('@/player/FlowDocViewHeader', () => ({
  FlowDocViewHeader: ({ title }: { title?: string }) => <header>{title}</header>,
}));
vi.mock('@/player/DocumentGuideOverviewBanner', () => ({
  DocumentGuideOverviewBanner: () => <div>overview-banner</div>,
}));
vi.mock('@/player/DocumentGuideCompleteCard', () => ({
  DocumentGuideCompleteCard: () => null,
}));
vi.mock('@/player/DocumentStepCard', () => ({
  DocumentStepCard: ({ step }: { step: { title: string } }) => <div>{step.title}</div>,
}));
vi.mock('@/player/DocumentSectionCard', () => ({ DocumentSectionCard: () => null }));
vi.mock('@/player/DocumentBranchCard', () => ({ DocumentBranchCard: () => null }));
vi.mock('@/player/DocumentLinkedPathSteps', () => ({ DocumentLinkedPathSteps: () => null }));
vi.mock('@/player/DocumentStepIndex', () => ({
  DocumentStepIndex: () => <nav>outline</nav>,
}));
vi.mock('@/components/PeacockStudioLoader', () => ({
  PeacockStudioLoader: () => <div>loader</div>,
}));
vi.mock('@/components/onboarding/HintAnchor', () => ({
  HintAnchor: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

import { DocumentView } from './DocumentView';

describe('DocumentView', () => {
  it('renders document outline and steps', () => {
    render(
      <MemoryRouter>
        <DocumentView documentId="doc-1" onModeChange={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('outline')).toBeInTheDocument();
    expect(screen.getByText('Open app')).toBeInTheDocument();
  });
});
