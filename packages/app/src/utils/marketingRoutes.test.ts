import { describe, expect, it } from 'vitest';
import {
  EXTENSION_INSTALL_PATH,
  LANDING_PATH,
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
} from '@/constants/routes';
import { isMarketingPath } from './marketingRoutes';

describe('isMarketingPath', () => {
  it('treats landing as marketing', () => {
    expect(isMarketingPath(LANDING_PATH)).toBe(true);
  });

  it('matches marketing prefixes and nested paths', () => {
    expect(isMarketingPath(PRICING_PATH)).toBe(true);
    expect(isMarketingPath(`${PRICING_PATH}/teams`)).toBe(true);
    expect(isMarketingPath(PRIVACY_PATH)).toBe(true);
    expect(isMarketingPath(TERMS_PATH)).toBe(true);
    expect(isMarketingPath(EXTENSION_INSTALL_PATH)).toBe(true);
    expect(isMarketingPath('/products')).toBe(true);
    expect(isMarketingPath('/products/tours')).toBe(true);
    expect(isMarketingPath('/solutions/hr')).toBe(true);
  });

  it('rejects app library paths', () => {
    expect(isMarketingPath('/dashboard')).toBe(false);
    expect(isMarketingPath('/docs/abc')).toBe(false);
    expect(isMarketingPath('/flow-docs')).toBe(false);
  });
});
