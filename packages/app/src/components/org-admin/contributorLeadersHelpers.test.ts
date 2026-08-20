import { describe, expect, it } from 'vitest';
import type { OrgContributorRow } from '@/cloud/repositories/organizationRepository';
import { contributorInitials, topContributorHint } from './contributorLeadersHelpers';

describe('contributorLeadersHelpers', () => {
  it('builds initials from display names', () => {
    expect(contributorInitials('')).toBe('?');
    expect(contributorInitials('   ')).toBe('?');
    expect(contributorInitials('Ada')).toBe('AD');
    expect(contributorInitials('Ada Lovelace')).toBe('AL');
  });

  it('summarizes the top contributor when count is positive', () => {
    const rows: OrgContributorRow[] = [
      { email: 'a@x.com', displayName: 'Ada', count: 4 },
      { email: 'b@x.com', displayName: 'Bob', count: 1 },
    ];
    expect(topContributorHint(rows, 'docs')).toBe('Ada · 4 docs');
  });

  it('returns null for empty or zero-count leaders', () => {
    expect(topContributorHint([], 'docs')).toBeNull();
    expect(
      topContributorHint([{ email: 'a@x.com', displayName: 'Ada', count: 0 }], 'docs'),
    ).toBeNull();
  });
});
