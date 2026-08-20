import { describe, expect, it } from 'vitest';
import {
  EXTENSION_INSTALL_PATH,
  LANDING_PATH,
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
} from '@/constants/routes';
import {
  isClerkForbiddenPath,
  isClerkOptionalPath,
  isMarketingPath,
  isPublicSharePath,
  isStaticExamplePath,
} from './marketingRoutes';

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

describe('public share / Clerk path helpers', () => {
  it('detects public share paths', () => {
    expect(isPublicSharePath('/s')).toBe(true);
    expect(isPublicSharePath('/s/tok')).toBe(true);
    expect(isPublicSharePath('/s/tok/embed')).toBe(true);
    expect(isPublicSharePath('/s/tok/edit')).toBe(true);
    expect(isPublicSharePath('/dashboard')).toBe(false);
    expect(isPublicSharePath('/solutions')).toBe(false);
  });

  it('treats share and marketing as Clerk-optional', () => {
    expect(isClerkOptionalPath('/')).toBe(true);
    expect(isClerkOptionalPath('/s/tok/embed')).toBe(true);
    expect(isClerkOptionalPath('/s/tok')).toBe(true);
    expect(isClerkOptionalPath('/dashboard')).toBe(false);
  });

  it('detects static example paths', () => {
    expect(isStaticExamplePath('/examples')).toBe(true);
    expect(isStaticExamplePath('/examples/kachabazar')).toBe(true);
    expect(isStaticExamplePath('/dashboard')).toBe(false);
  });

  it('forbids Clerk on embed iframes and static examples', () => {
    expect(isClerkForbiddenPath('/s/tok/embed')).toBe(true);
    expect(isClerkForbiddenPath('/s/tok/embed/')).toBe(true);
    expect(isClerkForbiddenPath('/examples/kachabazar')).toBe(true);
    expect(isClerkForbiddenPath('/s/tok')).toBe(false);
    expect(isClerkForbiddenPath('/s/tok/edit')).toBe(false);
    expect(isClerkForbiddenPath('/')).toBe(false);
  });

  it('treats static examples as Clerk-optional', () => {
    expect(isClerkOptionalPath('/examples/kachabazar')).toBe(true);
  });
});
