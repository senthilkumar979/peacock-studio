import { describe, expect, it } from 'vitest';
import { ogImageUrl } from '@/constants/site';
import { listPublicMarketingPaths } from '@/seo/publicPaths';
import { isNoindexPath } from '@/seo/routeMetaData';
import { isKnownMarketingPath, resolveRouteMeta } from '@/seo/resolveRouteMeta';
import { buildSocialMetaTags, resolveOgImage } from '@/seo/socialMetaTags';

describe('isNoindexPath', () => {
  it('noindexes app shells and share links', () => {
    expect(isNoindexPath('/dashboard')).toBe(true);
    expect(isNoindexPath('/s/abc123')).toBe(true);
    expect(isNoindexPath('/docs/uuid')).toBe(true);
    expect(isNoindexPath('/super-admin')).toBe(true);
  });

  it('allows marketing paths', () => {
    expect(isNoindexPath('/')).toBe(false);
    expect(isNoindexPath('/pricing')).toBe(false);
    expect(isNoindexPath('/products/flow-documents')).toBe(false);
  });
});

describe('resolveRouteMeta', () => {
  it('returns indexed marketing meta for product pages using the app logo', () => {
    const meta = resolveRouteMeta('/products/flow-documents');
    expect(meta.robots).toBe('index,follow');
    expect(meta.title).toContain('Flow Documents');
    expect(resolveOgImage(meta)).toBe(ogImageUrl());
    expect(meta.canonical).toBe('https://peacockstudio.app/products/flow-documents');
  });

  it('returns noindex for unknown paths', () => {
    const meta = resolveRouteMeta('/not-a-real-page');
    expect(meta.robots).toBe('noindex,nofollow');
    expect(meta.title).toContain('Page not found');
  });

  it('returns noindex for share links', () => {
    const meta = resolveRouteMeta('/s/token123');
    expect(meta.robots).toBe('noindex,nofollow');
  });
});

describe('listPublicMarketingPaths', () => {
  it('includes static, product, and solution routes', () => {
    const paths = listPublicMarketingPaths();
    expect(paths).toContain('/');
    expect(paths).toContain('/pricing');
    expect(paths).toContain('/products/flow-documents');
    expect(paths).toContain('/solutions/developers');
    expect(isKnownMarketingPath('/products/product-tours')).toBe(true);
    expect(isKnownMarketingPath('/unknown')).toBe(false);
  });
});

describe('buildSocialMetaTags', () => {
  it('includes OG dimensions and Twitter card fields', () => {
    const meta = resolveRouteMeta('/pricing');
    const tags = buildSocialMetaTags(meta);
    const keys = tags.map((tag) => tag.key);

    expect(keys).toContain('og:image:width');
    expect(keys).toContain('og:image:height');
    expect(keys).toContain('og:locale');
    expect(keys).toContain('twitter:card');
    expect(keys).toContain('twitter:image:alt');
  });
});
