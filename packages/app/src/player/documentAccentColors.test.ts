import { describe, expect, it } from 'vitest';
import { getBranchAccentColors, getPathAccentColors } from './documentAccentColors';

describe('documentAccentColors', () => {
  it('returns a stable accent palette for the same branch id', () => {
    const first = getBranchAccentColors('branch-a');
    const second = getBranchAccentColors('branch-a');
    expect(first).toEqual(second);
    expect(first.borderLeft).toMatch(/^border-/);
    expect(first.stepBadgeActive).toMatch(/^bg-/);
  });

  it('can return different accents for different branch ids', () => {
    const accents = Array.from({ length: 20 }, (_, index) =>
      getBranchAccentColors(`branch-${index}`),
    );
    const uniqueBorders = new Set(accents.map((accent) => accent.borderLeft));
    expect(uniqueBorders.size).toBeGreaterThan(1);
  });

  it('salts branch and path accents independently', () => {
    const sharedId = 'same-id';
    // Same id with different salt may still collide; assert shape + salt usage via inequality across many ids.
    const branch = getBranchAccentColors(sharedId);
    const path = getPathAccentColors(sharedId);
    expect(branch).toHaveProperty('iconBgActive');
    expect(path).toHaveProperty('iconBgActive');

    let foundDifference = false;
    for (let index = 0; index < 40; index += 1) {
      const id = `id-${index}`;
      if (getBranchAccentColors(id).borderLeft !== getPathAccentColors(id).borderLeft) {
        foundDifference = true;
        break;
      }
    }
    expect(foundDifference).toBe(true);
  });
});
