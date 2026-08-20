import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setSessionAuthState } from '@/cloud/sessionState';
import { SiteNav } from './SiteNav';
import { LandingSubNav } from './LandingSubNav';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: vi.fn(() => true),
}));

vi.mock('@/pages/solutions/useActiveSection', () => ({
  useActiveSection: () => 'problem',
}));

vi.mock('@/utils/extensionGate', () => ({
  getExtensionGatePath: (path: string) => path,
}));

describe('SiteNav', () => {
  beforeEach(() => {
    setSessionAuthState(true, false);
  });

  afterEach(() => {
    setSessionAuthState(false, false);
  });

  it('renders brand, Open App, and Sign in / Sign up for guests', () => {
    renderWithProviders(<SiteNav />, { routerEntries: ['/'] });
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByText('Peacock Studio')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Open App' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('hides Sign in / Sign up for signed-in users', () => {
    setSessionAuthState(true, true);
    renderWithProviders(<SiteNav />, { routerEntries: ['/'] });
    expect(screen.getByRole('link', { name: 'Open App' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument();
  });

  it('toggles the mobile menu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteNav />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });
});

describe('LandingSubNav', () => {
  beforeEach(() => {
    setSessionAuthState(true, false);
  });

  afterEach(() => {
    setSessionAuthState(false, false);
  });

  it('renders section links when visible', () => {
    renderWithProviders(<LandingSubNav visible />);
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Problem' })).toHaveAttribute('href', '#problem');
  });

  it('hides Sign in / Sign up in the mobile menu when signed in', async () => {
    setSessionAuthState(true, true);
    const user = userEvent.setup();
    renderWithProviders(<LandingSubNav visible />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getAllByRole('link', { name: 'Open App' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument();
  });
});
