import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isSignedIn: false, isLoaded: true, getToken: vi.fn() }),
  useUser: () => ({ isLoaded: true, user: null }),
  useClerk: () => ({ redirectToSignIn: vi.fn(), signOut: vi.fn() }),
  SignedIn: () => null,
  SignedOut: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
  getClerkPublishableKey: () => '',
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useIsAuthenticatedAppUser: () => false,
  useSessionMode: () => 'guest',
}));

vi.mock('@/pages/solutions/SolutionRoleSubNav', () => ({
  SolutionRoleSubNav: () => null,
}));
vi.mock('@/pages/solutions/SolutionRoleChallenges', () => ({
  SolutionRoleChallenges: () => null,
}));
vi.mock('@/pages/solutions/SolutionProductModules', () => ({
  SolutionProductModules: () => null,
}));
vi.mock('@/pages/solutions/SolutionRoleWhyPeacock', () => ({
  SolutionRoleWhyPeacock: () => null,
}));
vi.mock('@/pages/solutions/SolutionRoleDetailExtras', () => ({
  SolutionRoleDetailExtras: () => null,
}));
vi.mock('@/pages/solutions/SolutionRoleExploreMore', () => ({
  SolutionRoleExploreMore: () => null,
}));

import { SolutionRole } from './SolutionRole';

describe('SolutionRole', () => {
  it('renders role hero for known slug', () => {
    render(
      <MemoryRouter initialEntries={['/solutions/developers']}>
        <Routes>
          <Route path="/solutions/:roleSlug" element={<SolutionRole />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /developers & engineers/i })).toBeInTheDocument();
  });

  it('redirects unknown slug to /solutions', () => {
    render(
      <MemoryRouter initialEntries={['/solutions/not-a-role']}>
        <Routes>
          <Route path="/solutions/:roleSlug" element={<SolutionRole />} />
          <Route path="/solutions" element={<div>Solutions index</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Solutions index')).toBeInTheDocument();
  });
});
