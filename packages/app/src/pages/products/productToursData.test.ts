import { describe, expect, it } from 'vitest';
import {
  PRODUCT_TOUR_AUDIENCES,
  PRODUCT_TOUR_PAGE,
  TRADITIONAL_DOC_GAPS,
} from './productToursData';

describe('productToursData', () => {
  it('exports page copy and related collections', () => {
    expect(PRODUCT_TOUR_PAGE.eyebrow.length).toBeGreaterThan(0);
    expect(TRADITIONAL_DOC_GAPS.length).toBeGreaterThan(0);
    expect(PRODUCT_TOUR_AUDIENCES.length).toBeGreaterThan(0);
  });
});
