import { describe, expect, it } from 'vitest';
import { BETA_HERO, BETA_PERKS, PRICING_TIERS } from './pricingData';

describe('pricingData', () => {
  it('exports beta hero and perks', () => {
    expect(BETA_HERO.title).toMatch(/peacock/i);
    expect(BETA_PERKS.length).toBeGreaterThan(0);
  });

  it('exports three pricing tiers', () => {
    expect(PRICING_TIERS).toHaveLength(3);
    expect(PRICING_TIERS.map((t) => t.name)).toEqual(['Free', 'Team', 'Enterprise']);
  });
});
