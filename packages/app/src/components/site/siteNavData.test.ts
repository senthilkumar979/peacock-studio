import { describe, expect, it } from 'vitest';
import { LANDING_SUB_NAV_ITEMS, PRODUCT_NAV_ITEMS, SOLUTION_NAV_ITEMS } from './siteNavData';

describe('siteNavData', () => {
  it('lists landing section anchors', () => {
    expect(LANDING_SUB_NAV_ITEMS.map((i) => i.id)).toEqual([
      'problem',
      'solution',
      'preview',
      'features',
      'workflow',
      'platform-comparison',
      'faq',
    ]);
  });

  it('maps products and solutions to hrefs', () => {
    expect(PRODUCT_NAV_ITEMS.length).toBeGreaterThan(0);
    for (const item of PRODUCT_NAV_ITEMS) {
      expect(item.href).toBe(`/products/${item.slug}`);
      expect(item.label.length).toBeGreaterThan(0);
    }

    expect(SOLUTION_NAV_ITEMS.length).toBeGreaterThan(0);
    for (const item of SOLUTION_NAV_ITEMS) {
      expect(item.href).toBe(`/solutions/${item.slug}`);
      expect(item.label.length).toBeGreaterThan(0);
    }
  });
});
