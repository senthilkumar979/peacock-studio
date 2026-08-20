import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/pages/products/productsData';
import { SOLUTION_ROLES } from '@/pages/solutions/solutionsData';
import { listPublicMarketingPaths, MARKETING_STATIC_PATHS } from './publicPaths';

describe('publicPaths', () => {
  it('lists static marketing paths plus product and solution slugs', () => {
    const paths = listPublicMarketingPaths();

    for (const path of MARKETING_STATIC_PATHS) {
      expect(paths).toContain(path);
    }
    for (const product of PRODUCTS) {
      expect(paths).toContain(`/products/${product.slug}`);
    }
    for (const role of SOLUTION_ROLES) {
      expect(paths).toContain(`/solutions/${role.slug}`);
    }

    expect(new Set(paths).size).toBe(paths.length);
  });
});
