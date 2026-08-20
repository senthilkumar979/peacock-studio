import { describe, expect, it } from 'vitest';
import { formatVisibleLabel, humanizeIdentifier, sentenceCase } from './humanize';

describe('formatVisibleLabel', () => {
  it('returns empty for blank input', () => {
    expect(formatVisibleLabel('   ')).toBe('');
  });

  it('replaces ampersands, separators, and collapses whitespace', () => {
    expect(formatVisibleLabel('  foo_bar-baz  &  qux  ')).toBe('foo bar baz and qux');
  });
});

describe('humanizeIdentifier', () => {
  it('returns empty for blank input', () => {
    expect(humanizeIdentifier('')).toBe('');
  });

  it('title-cases words', () => {
    expect(humanizeIdentifier('sign_in_button')).toBe('Sign In Button');
  });
});

describe('sentenceCase', () => {
  it('returns empty for blank input', () => {
    expect(sentenceCase('  ')).toBe('');
  });

  it('capitalizes only the first letter', () => {
    expect(sentenceCase('sign_in_now')).toBe('Sign in now');
  });
});
