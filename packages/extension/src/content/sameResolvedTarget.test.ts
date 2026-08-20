import { describe, expect, it } from 'vitest';
import { isSameResolvedTarget } from './sameResolvedTarget';

describe('isSameResolvedTarget', () => {
  it('matches identical targets', () => {
    const el = document.createElement('div');
    expect(isSameResolvedTarget(el, el)).toBe(true);
  });

  it('matches ancestor/descendant pairs', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    expect(isSameResolvedTarget(parent, child)).toBe(true);
    expect(isSameResolvedTarget(child, parent)).toBe(true);
  });

  it('rejects unrelated nodes', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    expect(isSameResolvedTarget(a, b)).toBe(false);
  });

  it('rejects non-node event targets', () => {
    const el = document.createElement('div');
    expect(isSameResolvedTarget(el, window)).toBe(false);
    expect(isSameResolvedTarget(window, el)).toBe(false);
  });
});
