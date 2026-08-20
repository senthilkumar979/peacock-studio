import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/hooks/useConsent', () => ({
  useConsent: () => ({ isBannerVisible: true }),
}));

vi.mock('@/store/consentStore', () => ({
  useConsentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      acceptAll: vi.fn(),
      rejectNonEssential: vi.fn(),
      openPreferences: vi.fn(),
      isPreferencesOpen: true,
      record: { analytics: false },
      savePreferences: vi.fn(),
      closePreferences: vi.fn(),
    }),
}));

import { CookieConsentBanner } from './CookieConsentBanner';
import { CookiePreferencesModal } from './CookiePreferencesModal';

describe('consent smoke', () => {
  it('CookieConsentBanner shows region', () => {
    renderWithProviders(<CookieConsentBanner />);
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
  });

  it('CookiePreferencesModal dialog', () => {
    renderWithProviders(<CookiePreferencesModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
