import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('./useActiveSection', () => ({
  useActiveSection: () => 'challenges',
}));

import { getSolutionRoleBySlug } from './solutionsData';
import { SolutionRoleCard } from './SolutionRoleCard';
import { SolutionRoleHero } from './SolutionRoleHero';
import { SolutionRoleChallenges } from './SolutionRoleChallenges';
import { SolutionRoleWhyPeacock } from './SolutionRoleWhyPeacock';
import { SolutionRoleSubNav } from './SolutionRoleSubNav';

const role = getSolutionRoleBySlug('developers')!;

describe('solution presentational components', () => {
  it('SolutionRoleCard', () => {
    render(
      <MemoryRouter>
        <SolutionRoleCard role={role} index={0} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /developers/i })).toBeInTheDocument();
  });

  it('SolutionRoleHero', () => {
    render(
      <MemoryRouter>
        <SolutionRoleHero role={role} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /developers & engineers/i })).toBeInTheDocument();
  });

  it('SolutionRoleChallenges', () => {
    render(<SolutionRoleChallenges role={role} />);
    expect(screen.getByText(role.primaryChallenges[0]!.title)).toBeInTheDocument();
  });

  it('SolutionRoleWhyPeacock', () => {
    render(<SolutionRoleWhyPeacock role={role} />);
    expect(screen.getByText(role.whyPeacock.headline)).toBeInTheDocument();
  });

  it('SolutionRoleSubNav', () => {
    render(
      <MemoryRouter>
        <SolutionRoleSubNav role={role} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
