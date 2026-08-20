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

import { openSupportChat } from '@/utils/support';
import { BetaPromiseSection } from './BetaPromiseSection';
import { PricingTiersPreview } from './PricingTiersPreview';

describe('pricing sections', () => {
  it('BetaPromiseSection renders early-adopter promise', () => {
    render(<BetaPromiseSection />);
    expect(
      screen.getByRole('heading', { name: /you supported us first/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/free during beta/i)).toBeInTheDocument();
  });

  it('PricingTiersPreview renders Free tier', () => {
    render(
      <MemoryRouter>
        <PricingTiersPreview />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /^free$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^team$/i })).toBeInTheDocument();
  });

  it('Talk to us opens support chat', () => {
    render(
      <MemoryRouter>
        <PricingTiersPreview />
      </MemoryRouter>,
    );
    screen.getAllByRole('button', { name: /talk to us/i })[0].click();
    expect(openSupportChat).toHaveBeenCalled();
  });
});
