import { beforeEach, describe, expect, it } from 'vitest';
import {
  getPublicSharePresentation,
  getPublicShareToken,
  isPublicShareActive,
  isPublicShareEmbed,
  setPublicShareToken,
} from './publicShareContext';

describe('publicShareContext', () => {
  beforeEach(() => {
    setPublicShareToken(null);
  });

  it('defaults presentation to share when token set without presentation', () => {
    setPublicShareToken('tok');
    expect(getPublicShareToken()).toBe('tok');
    expect(getPublicSharePresentation()).toBe('share');
    expect(isPublicShareActive()).toBe(true);
    expect(isPublicShareEmbed()).toBe(false);
  });

  it('tracks embed presentation', () => {
    setPublicShareToken('tok', 'embed');
    expect(getPublicSharePresentation()).toBe('embed');
    expect(isPublicShareEmbed()).toBe(true);
  });

  it('clears presentation when token cleared', () => {
    setPublicShareToken('tok', 'embed');
    setPublicShareToken(null);
    expect(getPublicShareToken()).toBeNull();
    expect(getPublicSharePresentation()).toBeNull();
    expect(isPublicShareActive()).toBe(false);
  });
});
