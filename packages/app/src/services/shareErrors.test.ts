import { describe, expect, it } from 'vitest';
import { ShareNotAllowedError, isShareNotAllowedError } from './shareErrors';

describe('shareErrors', () => {
  it('identifies ShareNotAllowedError instances', () => {
    const error = new ShareNotAllowedError('draft');
    expect(error.name).toBe('ShareNotAllowedError');
    expect(error.message).toBe('draft');
    expect(isShareNotAllowedError(error)).toBe(true);
    expect(isShareNotAllowedError(new Error('x'))).toBe(false);
  });
});
