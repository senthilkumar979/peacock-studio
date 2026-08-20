import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ShareMethodPicker } from './ShareMethodPicker';
import { ShareLinkSecurityOptions } from './ShareLinkSecurityOptions';
import { ShareBranchingOptions } from './ShareBranchingOptions';
import { SharePdfPathOptions } from './SharePdfPathOptions';
import { ShareLinkPanel } from './ShareLinkPanel';

vi.mock('@/cloud/repositories/shareLinkRepository', () => ({
  listShareLinksForResource: vi.fn().mockResolvedValue([]),
  revokeShareLink: vi.fn(),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyPromise: vi.fn((p: Promise<unknown>) => p),
}));

import { ShareLinkManagePanel } from './ShareLinkManagePanel';

const branch = {
  id: 'b1',
  title: 'Payment branch',
  fromStepId: 's1',
  paths: [
    { id: 'p1', label: 'Card', stepIds: [] },
    { id: 'p2', label: 'Invoice', stepIds: [] },
  ],
};

const settings = {
  includeMainFlow: true,
  enabledPathIds: ['p1'],
  enabledBranchIds: ['b1'],
};

describe('share panels', () => {
  it('ShareMethodPicker shows methods', () => {
    renderWithProviders(
      <ShareMethodPicker value="link" onChange={vi.fn()} />,
    );
    expect(screen.getByText('Share as link')).toBeInTheDocument();
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    expect(screen.getByText('Embed code')).toBeInTheDocument();
  });

  it('ShareLinkSecurityOptions shows expiry', () => {
    renderWithProviders(
      <ShareLinkSecurityOptions
        accessMode="readonly"
        expiryPreset="never"
        requiresAuth={false}
        onExpiryPresetChange={vi.fn()}
        onRequiresAuthChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Link expiry')).toBeInTheDocument();
    expect(screen.getByText(/Require workspace members/i)).toBeInTheDocument();
  });

  it('ShareBranchingOptions lists branches', () => {
    renderWithProviders(
      <ShareBranchingOptions
        branches={[branch as never]}
        settings={settings}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Branching paths')).toBeInTheDocument();
    expect(screen.getByText('Payment branch')).toBeInTheDocument();
  });

  it('SharePdfPathOptions lists paths', () => {
    renderWithProviders(
      <SharePdfPathOptions
        branches={[branch as never]}
        selections={{ b1: 'p1' }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Paths to include')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
  });

  it('ShareLinkPanel shows access modes', () => {
    renderWithProviders(
      <ShareLinkPanel
        accessMode="readonly"
        shareUrl="https://example.com/s/x"
        hasBranches={false}
        branches={[]}
        branchSettings={settings}
        onAccessModeChange={vi.fn()}
        onBranchSettingsChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Link access')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read-only' })).toBeInTheDocument();
  });

  it('ShareLinkManagePanel shows empty state', async () => {
    renderWithProviders(
      <ShareLinkManagePanel resourceType="document" resourceId="doc-1" />,
    );
    expect(
      await screen.findByText(/No active token links yet/i),
    ).toBeInTheDocument();
  });
});
