import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/hooks/useOrganization', () => ({
  useShareMethodAccess: () => ({
    canShare: true,
    canExport: true,
    canEmbed: true,
    disabledReasons: {},
  }),
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useIsGuestSession: () => false,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => true,
}));

vi.mock('@/storage/libraryRouter', () => ({
  getProductTour: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/services/shareLinkService', () => ({
  createProductTourShareUrl: vi.fn().mockResolvedValue('https://example.com/s/tour'),
  createProductTourEmbedCode: vi.fn().mockResolvedValue('<iframe></iframe>'),
}));

vi.mock('@/cloud/repositories/shareLinkRepository', () => ({
  listShareLinksForResource: vi.fn().mockResolvedValue([]),
  revokeShareLink: vi.fn(),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyPromise: vi.fn((p: Promise<unknown>) => p),
}));

vi.mock('@/pdf/exportProductTourPdf', () => ({
  exportProductTourPdf: vi.fn(),
  tourHasExportableDemos: () => true,
}));

import { ShareProductTourModal } from './ShareProductTourModal';

const tour = {
  id: 'tour-1',
  title: 'Onboarding tour',
  description: '',
  status: 'live',
  personaId: null,
  goal: '',
  features: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('ShareProductTourModal', () => {
  it('renders share dialog when open', async () => {
    renderWithProviders(
      <ShareProductTourModal isOpen tourId="tour-1" tour={tour as never} onClose={vi.fn()} />,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Share product tour' })).toBeInTheDocument();
  });
});
