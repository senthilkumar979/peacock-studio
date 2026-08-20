import { describe, expect, it } from 'vitest';
import { rewriteStepDescription } from './stepRewriteStub';

describe('stepRewriteStub', () => {
  it('returns text unchanged', () => {
    expect(rewriteStepDescription('Click Save')).toBe('Click Save');
  });
});
