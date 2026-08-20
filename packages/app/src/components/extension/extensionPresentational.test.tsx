import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChromeWebStoreLink } from './ChromeWebStoreLink';
import { ExtensionStoreLink } from './ExtensionStoreLink';
import { ExtensionMissingBanner } from './ExtensionMissingBanner';
import { CaptureDesktopRequired } from './CaptureDesktopRequired';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@/utils/getPreferredExtensionStore', () => ({
  getPreferredExtensionStoreListing: () => ({
    storeUrl: 'https://chrome.example/ext',
    extensionId: 'abc',
    label: 'Chrome Web Store',
  }),
}));

vi.mock('@/hooks/useExtensionInstalled', () => ({
  useExtensionInstalled: vi.fn(() => ({
    status: 'missing',
    isInstalled: false,
    isChecking: false,
    recheck: vi.fn(),
  })),
}));

vi.mock('@/utils/isCaptureUnsupportedClient', () => ({
  isCaptureUnsupportedClient: vi.fn(() => false),
}));

vi.mock('@/components/site/SiteNav', () => ({
  SiteNav: () => <nav>Site nav</nav>,
}));

vi.mock('@/components/AppFooter', () => ({
  AppFooter: () => <footer>Footer</footer>,
}));

import { useExtensionInstalled } from '@/hooks/useExtensionInstalled';
import { isCaptureUnsupportedClient } from '@/utils/isCaptureUnsupportedClient';

describe('extension links and banners', () => {
  beforeEach(() => {
    vi.mocked(useExtensionInstalled).mockReturnValue({
      status: 'missing',
      isInstalled: false,
      isChecking: false,
      recheck: vi.fn(),
    });
    vi.mocked(isCaptureUnsupportedClient).mockReturnValue(false);
  });

  it('ExtensionStoreLink and ChromeWebStoreLink open the store', () => {
    render(<ExtensionStoreLink />);
    expect(screen.getByRole('link', { name: /Peacock Studio extension/i })).toHaveAttribute(
      'href',
      'https://chrome.example/ext',
    );

    render(<ChromeWebStoreLink>Get extension</ChromeWebStoreLink>);
    expect(screen.getByRole('link', { name: /Get extension/i })).toBeInTheDocument();
  });

  it('ExtensionMissingBanner alerts when extension is missing', () => {
    render(<ExtensionMissingBanner />);
    expect(screen.getByRole('alert')).toHaveTextContent(/extension not detected/i);
  });

  it('ExtensionMissingBanner shows desktop required on unsupported clients', () => {
    vi.mocked(isCaptureUnsupportedClient).mockReturnValue(true);
    renderWithProviders(<ExtensionMissingBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(/Capture needs a desktop browser/i);
  });

  it('CaptureDesktopRequired card and banner variants', () => {
    const { unmount } = renderWithProviders(
      <CaptureDesktopRequired variant="banner" surface="test" />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/Capture needs a desktop browser/i);
    unmount();

    renderWithProviders(<CaptureDesktopRequired variant="card" surface="test" />);
    expect(screen.getByRole('heading', { name: /Capture needs a desktop browser/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open library' })).toBeInTheDocument();
  });
});
