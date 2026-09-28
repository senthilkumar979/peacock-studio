import { describe, expect, it } from 'vitest';
import { FREE_FEATURE_GROUPS, FREE_HERO, FREE_PROMISES } from './pricingData';

describe('pricingData', () => {
  it('exports free-product hero and promises', () => {
    expect(FREE_HERO.title).toMatch(/free/i);
    expect(FREE_PROMISES.length).toBeGreaterThan(0);
  });

  it('groups included features without pricing tiers', () => {
    expect(FREE_FEATURE_GROUPS).toHaveLength(3);
    expect(FREE_FEATURE_GROUPS.map((group) => group.name)).toEqual([
      'Create',
      'Share',
      'Understand',
    ]);
  });
});
