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

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/services/shareLinkService', () => ({
  createDocumentShareUrl: vi.fn().mockResolvedValue('https://example.com/s/token'),
  createDocumentEmbedCode: vi.fn().mockResolvedValue('<iframe></iframe>'),
}));

vi.mock('@/cloud/repositories/shareLinkRepository', () => ({
  listShareLinksForResource: vi.fn().mockResolvedValue([]),
  revokeShareLink: vi.fn(),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyPromise: vi.fn((p: Promise<unknown>) => p),
}));

vi.mock('@/pdf/exportFlowPdf', () => ({
  exportFlowPdf: vi.fn(),
}));

import { ShareDocumentModal } from './ShareDocumentModal';

const flow = {
  flow: {
    id: 'flow-1',
    title: 'Payroll guide',
    description: '',
    version: '1.0',
    generatedAt: Date.now(),
    sections: [],
  },
  branches: [],
};

describe('ShareDocumentModal', () => {
  it('renders share dialog when open', async () => {
    renderWithProviders(
      <ShareDocumentModal
        isOpen
        documentId="doc-1"
        onClose={vi.fn()}
        flow={flow as never}
        steps={[]}
        status="live"
      />,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Share documentation' })).toBeInTheDocument();
  });

  it('returns null when closed', () => {
    const { container } = renderWithProviders(
      <ShareDocumentModal isOpen={false} documentId="doc-1" onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders with draft status and empty optional props', async () => {
    renderWithProviders(
      <ShareDocumentModal
        isOpen
        documentId="doc-2"
        onClose={vi.fn()}
        flow={flow as never}
        steps={[]}
        screenshotUrls={{}}
        stepResources={[]}
        status="draft"
        onShareSettingsSave={vi.fn()}
      />,
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
