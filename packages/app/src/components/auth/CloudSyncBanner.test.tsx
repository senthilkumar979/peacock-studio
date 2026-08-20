import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

const CLOUD_SYNC_SNAPSHOT = {
  phase: 'syncing' as const,
  message: 'Syncing to cloud…',
  visible: true,
  importedDocuments: 0,
  exceedsFreeLimit: false,
};

vi.mock('@/cloud/cloudSyncState', () => ({
  getCloudSyncSnapshot: () => CLOUD_SYNC_SNAPSHOT,
  subscribeCloudSyncState: () => () => undefined,
  setCloudSyncState: vi.fn(),
}));

vi.mock('@/components/auth/UpgradeAccountModal', () => ({
  UpgradeAccountModal: () => null,
}));

import { CloudSyncBanner } from './CloudSyncBanner';

describe('CloudSyncBanner', () => {
  it('shows syncing message', () => {
    renderWithProviders(<CloudSyncBanner />);
    expect(screen.getByText('Syncing to cloud…')).toBeInTheDocument();
  });
});
