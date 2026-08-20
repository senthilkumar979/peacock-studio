import { describe, expect, it } from 'vitest';
import { getProductBySlug, PRODUCTS } from './productsData';

describe('productsData', () => {
  it('exports three products with slugs', () => {
    expect(PRODUCTS).toHaveLength(3);
    expect(PRODUCTS.map((p) => p.slug)).toEqual([
      'flow-documents',
      'product-tours',
      'capture-screenshot-editor',
    ]);
  });

  it('resolves products by slug', () => {
    expect(getProductBySlug('flow-documents')?.name).toMatch(/flow documents/i);
    expect(getProductBySlug('missing')).toBeUndefined();
  });
});
