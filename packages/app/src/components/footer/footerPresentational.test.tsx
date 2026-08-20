import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FooterLegalLinks } from './FooterLegalLinks';
import { PublicAppFooter } from './PublicAppFooter';
import { AuthenticatedAppFooter } from './AuthenticatedAppFooter';
import { renderWithProviders } from '@/test/renderWithProviders';

const openPreferences = vi.fn();

vi.mock('@/store/consentStore', () => ({
  useConsentStore: (selector: (s: { openPreferences: () => void }) => unknown) =>
    selector({ openPreferences }),
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: vi.fn(() => true),
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'cloud'),
}));

vi.mock('@/components/extension/ChromeWebStoreLink', () => ({
  ChromeWebStoreLink: () => <a href="https://ext.example">Extension</a>,
}));

import { isCloudSyncEnabled } from '@/cloud/config';
import { useSessionMode } from '@/hooks/useSessionMode';

describe('footer components', () => {
  it('FooterLegalLinks opens cookie preferences', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FooterLegalLinks withSeparators />);
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cookie preferences' }));
    expect(openPreferences).toHaveBeenCalled();
  });

  it('PublicAppFooter shows explore links and auth actions when cloud sync on', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    renderWithProviders(<PublicAppFooter />);
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create account' })).toBeInTheDocument();
  });

  it('AuthenticatedAppFooter shows workspace nav and session hint', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    vi.mocked(useSessionMode).mockReturnValue('cloud');
    renderWithProviders(<AuthenticatedAppFooter />);
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Library synced to your account')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Library shortcuts' })).toBeInTheDocument();
  });
});
