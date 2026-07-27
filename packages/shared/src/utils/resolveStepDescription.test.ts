import { describe, expect, it } from 'vitest';
import { resolveStepDescription } from './resolveStepDescription';

describe('resolveStepDescription', () => {
  it('falls back to generated description when notes are empty', () => {
    expect(
      resolveStepDescription({
        notes: '',
        generatedDescription: 'Click the Save button.',
      }),
    ).toBe('Click the Save button.');
  });

  it('returns custom notes when provided', () => {
    expect(
      resolveStepDescription({
        notes: 'Custom tip for reviewers.',
        generatedDescription: 'Click the Save button.',
      }),
    ).toBe('Custom tip for reviewers.');
  });

  it('returns empty string when hideDescription is true', () => {
    expect(
      resolveStepDescription({
        notes: '',
        generatedDescription: 'Click the Save button.',
        hideDescription: true,
      }),
    ).toBe('');
  });

  it('returns empty string when hideDescription is true even with custom notes', () => {
    expect(
      resolveStepDescription({
        notes: 'Should not show',
        generatedDescription: 'Click the Save button.',
        hideDescription: true,
      }),
    ).toBe('');
  });
});
