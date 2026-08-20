import { beforeEach, describe, expect, it } from 'vitest';
import { consumeIntentionalSignOut, markIntentionalSignOut } from './sessionIntent';

describe('sessionIntent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('mark then consume returns true once', () => {
    markIntentionalSignOut();
    expect(consumeIntentionalSignOut()).toBe(true);
    expect(consumeIntentionalSignOut()).toBe(false);
  });

  it('consume returns false when unset', () => {
    expect(consumeIntentionalSignOut()).toBe(false);
  });
});
