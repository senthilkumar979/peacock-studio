import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentGuideOverviewBanner } from './DocumentGuideOverviewBanner';

describe('DocumentGuideOverviewBanner', () => {
  it('shows singular/plural step copy and opens overview', async () => {
    const user = userEvent.setup();
    const onOpenOverview = vi.fn();
    const { rerender } = render(
      <DocumentGuideOverviewBanner
        title="Checkout"
        stepCount={1}
        onOpenOverview={onOpenOverview}
      />,
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText(/1 step ·/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Open overview/i }));
    expect(onOpenOverview).toHaveBeenCalledOnce();

    rerender(
      <DocumentGuideOverviewBanner title="Checkout" stepCount={4} onOpenOverview={onOpenOverview} />,
    );
    expect(screen.getByText(/4 steps ·/)).toBeInTheDocument();
  });
});
