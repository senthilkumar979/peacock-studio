import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { Toolbar } from './Toolbar';

const flow = {
  flow: {
    title: 'Editor flow',
    description: '',
    version: '1.0.0',
    tags: [],
  },
  metadata: { createdAt: 1 },
  steps: [],
};

const state = {
  flow,
  status: 'draft' as const,
  setDocumentStatus: vi.fn(),
  documentId: 'doc-1',
  isLoaded: true,
  updateFlowDetails: vi.fn(),
  getState: () => state,
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: Object.assign(
    vi.fn((selector: (s: typeof state) => unknown) => selector(state)),
    { getState: () => state },
  ),
  usePlayableSteps: vi.fn(() => [{ id: 'step-1' }]),
}));

vi.mock('@/hooks/useDocumentShareModal', () => ({
  useDocumentShareModal: () => ({
    openShare: vi.fn(),
    shareModal: null,
  }),
}));

vi.mock('@/services/flowLibraryService', () => ({
  persistCurrentFlow: vi.fn(),
  persistDocumentStatus: vi.fn(),
  suggestUniqueTitleVersion: vi.fn(),
  listFlowSummaries: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/storage/libraryRouter', () => ({
  getFlowDocument: vi.fn(),
}));

vi.mock('@/components/onboarding/FirstTimeTooltip', () => ({
  FirstTimeTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./FlowDetailsDrawer', () => ({
  FlowDetailsDrawer: () => null,
}));

vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Toolbar', () => {
  beforeEach(() => {
    sessionStorage.setItem('peacock-flow-details-prompted-1', '1');
  });

  it('smoke-renders editor chrome with title and actions', () => {
    render(
      <MemoryRouter>
        <Toolbar documentId="doc-1" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Editor flow')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('accepts editor hint props without crashing', () => {
    render(
      <MemoryRouter>
        <Toolbar
          documentId="doc-1"
          onEditorHintsReady={vi.fn()}
          editorHints={{
            activeHintId: null,
            dismissHint: vi.fn(),
            hintStep: () => '1 of 3',
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Editor flow')).toBeInTheDocument();
  });
});
