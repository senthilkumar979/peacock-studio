import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getSolutionRoleBySlug } from './solutionsData';
import { SolutionRoleDetailExtras } from './SolutionRoleDetailExtras';
import { SolutionProductModules } from './SolutionProductModules';
import { SolutionRoleExploreMore } from './SolutionRoleExploreMore';

const role = getSolutionRoleBySlug('developers')!;

describe('solution extras smoke', () => {
  it('SolutionRoleDetailExtras', () => {
    render(
      <MemoryRouter>
        <SolutionRoleDetailExtras role={role} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/typical workflows/i)).toBeInTheDocument();
  });

  it('SolutionProductModules', () => {
    render(
      <MemoryRouter>
        <SolutionProductModules role={role} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/peacock capabilities/i)).toBeInTheDocument();
    expect(screen.getByText(/how peacock helps/i)).toBeInTheDocument();
  });

  it('SolutionRoleExploreMore', () => {
    render(
      <MemoryRouter>
        <SolutionRoleExploreMore role={role} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/other role solutions/i)).toBeInTheDocument();
  });
});
