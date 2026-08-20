import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
}));

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
}));

vi.mock('@/hooks/useCloudLibraryReady', () => ({
  useCloudLibraryReady: () => ({ isReady: false }),
}));

vi.mock('@/cloud/publicShareClient', () => ({
  resolvePublicShareLink: vi.fn(),
  verifyEditableShareLink: vi.fn(),
}));

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

import { EditableShareRedirect } from './EditableShareRedirect';

describe('EditableShareRedirect', () => {
  it('shows cloud sync required when sync is off', () => {
    renderWithProviders(<EditableShareRedirect token="abc" />);
    expect(screen.getByRole('heading', { name: /Cloud sync required/i })).toBeInTheDocument();
  });
});
