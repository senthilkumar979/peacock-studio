import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from './AppFooter';

vi.mock('@/hooks/useSessionMode', () => ({
  useIsAuthenticatedAppUser: vi.fn(),
}));

vi.mock('@/components/footer/AuthenticatedAppFooter', () => ({
  AuthenticatedAppFooter: () => <footer data-testid="auth-footer">Auth footer</footer>,
}));

vi.mock('@/components/footer/PublicAppFooter', () => ({
  PublicAppFooter: () => <footer data-testid="public-footer">Public footer</footer>,
}));

import { useIsAuthenticatedAppUser } from '@/hooks/useSessionMode';

describe('AppFooter', () => {
  it('renders authenticated footer when signed in', () => {
    vi.mocked(useIsAuthenticatedAppUser).mockReturnValue(true);
    render(<AppFooter />);
    expect(screen.getByTestId('auth-footer')).toBeInTheDocument();
  });

  it('renders public footer for guests', () => {
    vi.mocked(useIsAuthenticatedAppUser).mockReturnValue(false);
    render(<AppFooter />);
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });
});
