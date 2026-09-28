import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/utils/support', () => ({
  openSupportChat: vi.fn(),
}));

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
  identifyUser: vi.fn(),
}));

import { FreePromiseSection } from './BetaPromiseSection';
import { FreeFeaturesSection } from './PricingTiersPreview';

describe('pricing sections', () => {
  it('FreePromiseSection renders the free-product promise', () => {
    render(<FreePromiseSection />);
    expect(
      screen.getByRole('heading', { name: /build useful documentation/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no subscription fee/i)).toBeInTheDocument();
  });

  it('FreeFeaturesSection renders feature groups instead of tiers', () => {
    render(
      <MemoryRouter>
        <FreeFeaturesSection />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /^create$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^share$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^understand$/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^team$/i })).not.toBeInTheDocument();
  });
});
