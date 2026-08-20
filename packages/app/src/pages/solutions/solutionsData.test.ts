import { describe, expect, it } from 'vitest';
import {
  getSolutionRoleBySlug,
  PEACOCK_CATEGORY_STATEMENT,
  SOLUTION_ROLE_GROUPS,
  SOLUTION_ROLES,
} from './solutionsData';

describe('solutionsData', () => {
  it('exports category statement and roles', () => {
    expect(PEACOCK_CATEGORY_STATEMENT.headline).toMatch(/system of record/i);
    expect(SOLUTION_ROLES.length).toBeGreaterThan(0);
    expect(SOLUTION_ROLE_GROUPS.length).toBeGreaterThan(0);
  });

  it('resolves roles by slug', () => {
    expect(getSolutionRoleBySlug('developers')?.shortTitle).toMatch(/developers/i);
    expect(getSolutionRoleBySlug('missing')).toBeUndefined();
  });
});
