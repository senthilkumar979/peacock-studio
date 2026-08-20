import { describe, expect, it } from 'vitest';
import { formatUpdatedByLine, resolveDisplayNameFromEmails } from './formatUpdatedByLine';

const formatDate = (ms: number) => `DATE(${ms})`;

describe('resolveDisplayNameFromEmails', () => {
  it('prefers updatedBy over createdBy', () => {
    expect(
      resolveDisplayNameFromEmails('a@x.com', 'b@x.com', {
        'a@x.com': 'Alice',
        'b@x.com': 'Bob',
      }),
    ).toBe('Alice');
  });

  it('falls back to createdBy when updatedBy missing', () => {
    expect(
      resolveDisplayNameFromEmails(null, 'B@x.com', { 'b@x.com': ' Bob ' }),
    ).toBe('Bob');
  });

  it('returns null when emails empty or names missing', () => {
    expect(resolveDisplayNameFromEmails('  ', null, {})).toBeNull();
    expect(resolveDisplayNameFromEmails('a@x.com', null, {})).toBeNull();
    expect(resolveDisplayNameFromEmails('a@x.com', null, { 'a@x.com': '  ' })).toBeNull();
  });
});

describe('formatUpdatedByLine', () => {
  it('returns only the date when no display name resolves', () => {
    expect(formatUpdatedByLine(1000, null, formatDate)).toBe('DATE(1000)');
  });

  it('includes Updated prefix and owner by default', () => {
    expect(
      formatUpdatedByLine(1000, 'a@x.com', formatDate, null, { 'a@x.com': 'Ada' }),
    ).toBe('Updated DATE(1000) · Ada');
  });

  it('omits Updated prefix and owner when flags are false', () => {
    expect(
      formatUpdatedByLine(1000, 'a@x.com', formatDate, null, { 'a@x.com': 'Ada' }, false, false),
    ).toBe('DATE(1000) ');
  });
});
