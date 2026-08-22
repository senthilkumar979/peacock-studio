import { describe, expect, it } from 'vitest';
import { REMOTION_PLAYER_EMBEDDING_NOTE } from './videoConstants';

describe('videoConstants license note', () => {
  it('documents watch-only Player embedding with no web renderer', () => {
    expect(REMOTION_PLAYER_EMBEDDING_NOTE).toMatch(/Watch-only Remotion Player/);
    expect(REMOTION_PLAYER_EMBEDDING_NOTE).toMatch(/4\+/);
  });
});
