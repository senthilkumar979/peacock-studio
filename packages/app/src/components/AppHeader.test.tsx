import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/hooks/useLibraryBackState', () => ({
  useLibraryBackLink: () => ({ from: '/dashboard', fromLabel: 'Library' }),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      flow: { id: 'f1', title: 'Flow' },
      steps: [],
      screenshotUrls: {},
      shareSettings: { includeMainFlow: true, enabledPathIds: [], enabledBranchIds: [] },
      status: 'draft',
      updateShareSettings: vi.fn(),
    }),
}));

vi.mock('@/services/flowLibraryService', () => ({
  persistCurrentFlow: vi.fn(),
}));

vi.mock('@/components/share/ShareDocumentModal', () => ({
  ShareDocumentModal: () => null,
}));
vi.mock('@/components/share/ShareRouteModal', () => ({
  ShareRouteModal: () => null,
}));
vi.mock('@/components/share/ShareProductTourModal', () => ({
  ShareProductTourModal: () => null,
}));

import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders title', () => {
    renderWithProviders(<AppHeader title="My guide" homeLink />);
    expect(screen.getByText('My guide')).toBeInTheDocument();
  });
});
