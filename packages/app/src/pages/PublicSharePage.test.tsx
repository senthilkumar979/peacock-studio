import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ token: 'tok-1' }) };
});

vi.mock('@/analytics/featureFlags', () => ({
  isPublicShareFeatureEnabled: () => true,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncFlagEnabled: () => true,
}));

vi.mock('@/cloud/planLimits', () => ({
  shouldShowEmbedWatermark: () => false,
}));

vi.mock('@/hooks/useFlowDocDefaultView', () => ({
  useFlowDocDefaultView: () => 'hub',
}));

vi.mock('@/hooks/usePublicShare', () => ({
  usePublicShare: () => ({
    link: {
      token: 'tok-1',
      resourceType: 'document',
      resourceId: 'doc-1',
      access: 'view',
      channel: 'link',
      settings: { presenter: false },
    },
    isLoading: false,
    error: null,
    errorTitle: null,
    requiresSignIn: false,
  }),
}));

vi.mock('@/hooks/useHydrateResourceLabels', () => ({
  useHydrateResourceLabels: vi.fn(),
}));

vi.mock('@/hooks/usePublicSharedDocument', () => ({
  usePublicSharedDocument: () => ({
    shareLinkViewMode: 'hub',
    isReady: true,
  }),
}));

vi.mock('@/seo/ShareDocumentMeta', () => ({
  ShareDocumentMeta: () => null,
}));

vi.mock('@/player/FlowDocExperienceViews', () => ({
  FlowDocExperienceViews: () => <div>shared-experience</div>,
}));

vi.mock('@/pages/ProductTourLearner', () => ({
  ProductTourLearner: () => <div>tour-learner</div>,
}));

vi.mock('@/components/errors/AppErrorBoundary', () => ({
  AppErrorBoundary: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/share/ShareAuthRequiredGate', () => ({
  ShareAuthRequiredGate: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/share/EditableShareRedirect', () => ({
  EditableShareRedirect: () => <div>edit-redirect</div>,
}));

vi.mock('@/components/embed/PeacockEmbedWatermark', () => ({
  PeacockEmbedWatermark: () => null,
}));

import { PublicSharePage } from './PublicSharePage';

describe('PublicSharePage', () => {
  it('renders shared document experience', () => {
    renderAtRoute('/s/tok-1', <PublicSharePage mode="view" />);
    expect(screen.getByText('shared-experience')).toBeInTheDocument();
  });

  it('renders editable redirect in edit mode', () => {
    renderAtRoute('/s/tok-1/edit', <PublicSharePage mode="edit" />);
    expect(screen.getByText('edit-redirect')).toBeInTheDocument();
  });
});
