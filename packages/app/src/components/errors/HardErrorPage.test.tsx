import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HardErrorPage } from './HardErrorPage';
import { ResourceNotFoundPage } from './ResourceNotFoundPage';
import { GenericErrorPage } from './GenericErrorPage';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

describe('HardErrorPage family', () => {
  it('renders title, actions, and tracks analytics', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { trackEvent } = await import('@/analytics/analyticsClient');

    renderWithProviders(
      <HardErrorPage
        title="Crash"
        description="Broken"
        detail="stack"
        onRetry={onRetry}
        homeLabel="Library"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Crash' })).toBeInTheDocument();
    expect(screen.getByText('Broken')).toBeInTheDocument();
    expect(screen.getByText('Technical details')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Library' })).toBeInTheDocument();
  });

  it('delegates embed mode to EmbedErrorPanel', () => {
    renderWithProviders(
      <HardErrorPage embed title="Embed fail" description="No nav" />,
    );
    expect(screen.getByRole('heading', { name: 'Embed fail' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it('ResourceNotFoundPage and GenericErrorPage wrap HardErrorPage', () => {
    const { unmount } = renderWithProviders(
      <ResourceNotFoundPage title="Missing doc" description="Gone" />,
    );
    expect(screen.getByRole('heading', { name: 'Missing doc' })).toBeInTheDocument();
    unmount();

    renderWithProviders(<GenericErrorPage title="Alias error" />);
    expect(screen.getByRole('heading', { name: 'Alias error' })).toBeInTheDocument();
  });
});
