import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppErrorBoundary } from './AppErrorBoundary';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@/utils/appError', () => ({
  logAppError: vi.fn(),
}));

function Boom(): never {
  throw new Error('render boom');
}

describe('AppErrorBoundary', () => {
  it('renders children when healthy', () => {
    renderWithProviders(
      <AppErrorBoundary>
        <p>All good</p>
      </AppErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('shows hard error UI and retries', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderWithProviders(
      <AppErrorBoundary title="Boundary crash">
        <Boom />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Boundary crash' })).toBeInTheDocument();
    expect(screen.getByText('render boom')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    // After retry, Boom throws again so error UI remains.
    expect(screen.getByRole('heading', { name: 'Boundary crash' })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
