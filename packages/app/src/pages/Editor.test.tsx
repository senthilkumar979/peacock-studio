import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ documentId: 'doc-1' }) };
});

vi.mock('@/hooks/usePayload', () => ({
  usePayload: () => ({ isLoading: false, isLoaded: true, error: null }),
}));

vi.mock('@/hooks/useSavedDocument', () => ({
  useSavedDocument: () => ({ isLoading: false, isLoaded: true, error: null }),
}));

vi.mock('@/hooks/usePersistDocument', () => ({
  usePersistDocument: vi.fn(),
}));

vi.mock('@/hooks/useHydrateResourceLabels', () => ({
  useHydrateResourceLabels: vi.fn(),
}));

vi.mock('@/hooks/useFirstTimeHint', () => ({
  useFirstTimeHintTour: () => ({
    activeHintId: null,
    dismissHint: vi.fn(),
    skipAllHints: vi.fn(),
  }),
}));

vi.mock('@/analytics/analyticsClient', () => ({ trackEvent: vi.fn() }));
vi.mock('@/utils/isCaptureUnsupportedClient', () => ({
  isCaptureUnsupportedClient: () => false,
}));
vi.mock('@/utils/notify', () => ({ notifyPersistError: vi.fn() }));
vi.mock('@/services/flowLibraryService', () => ({
  persistCurrentFlow: vi.fn(),
  saveNewFlowFromStore: vi.fn(),
}));

const flowState = {
  documentId: 'doc-1',
  resetFlow: vi.fn(),
  addPathToBranch: vi.fn(),
  addBranchWithPath: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: typeof flowState) => unknown) => selector(flowState),
  usePlayableSteps: () => [{ id: 's1' }],
  useSelectedBranch: () => null,
  useSelectedSection: () => null,
  useSelectedStep: () => ({ id: 's1', title: 'Step 1' }),
}));

vi.mock('@/components/auth/GuestDocumentGate', () => ({
  GuestDocumentGate: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/errors/AppErrorBoundary', () => ({
  AppErrorBoundary: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/editor/Toolbar', () => ({ Toolbar: () => <div>toolbar</div> }));
vi.mock('@/editor/StepList', () => ({ StepList: () => <div>step-list</div> }));
vi.mock('@/editor/Canvas', () => ({ Canvas: () => <div>canvas</div> }));
vi.mock('@/editor/StepPanel', () => ({ StepPanel: () => <div>step-panel</div> }));
vi.mock('@/editor/SectionPanel', () => ({ SectionPanel: () => null }));
vi.mock('@/editor/BranchPanel', () => ({ BranchPanel: () => null }));
vi.mock('@/editor/FlowBranchCard', () => ({ FlowBranchCard: () => null }));
vi.mock('@/editor/LinkPeacockDocModal', () => ({ LinkPeacockDocModal: () => null }));
vi.mock('@/components/FlowSectionCard', () => ({ FlowSectionCard: () => null }));
vi.mock('@/components/onboarding/FirstTimeTooltip', () => ({
  FirstTimeTooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/onboarding/FirstCaptureChecklist', () => ({
  FirstCaptureChecklist: () => null,
}));
vi.mock('@/components/onboarding/PendingCaptureBar', () => ({
  PendingCaptureBar: () => null,
}));
vi.mock('@/components/ConfirmDialog', () => ({ ConfirmDialog: () => null }));

import { Editor } from './Editor';

describe('Editor', () => {
  it('renders editor layout when document loaded', () => {
    renderAtRoute('/docs/doc-1/edit', <Editor />);
    expect(screen.getByText('toolbar')).toBeInTheDocument();
    expect(screen.getByText('step-list')).toBeInTheDocument();
    expect(screen.getByText('canvas')).toBeInTheDocument();
    expect(screen.getByText('step-panel')).toBeInTheDocument();
  });
});
