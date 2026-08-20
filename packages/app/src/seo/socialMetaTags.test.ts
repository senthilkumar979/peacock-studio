import { describe, expect, it } from 'vitest';
import { ogImageUrl, SITE_NAME } from '@/constants/site';
import type { RouteMeta } from './routeMetaData';
import { buildSocialMetaTags, resolveOgImage } from './socialMetaTags';

const baseMeta: RouteMeta = {
  title: 'Pricing · Peacock Studio',
  description: 'Plans for flow docs',
  path: '/pricing',
  robots: 'index,follow',
  canonical: 'https://peacockstudio.app/pricing',
};

describe('socialMetaTags', () => {
  it('falls back to the default OG image', () => {
    expect(resolveOgImage(baseMeta)).toBe(ogImageUrl());
    expect(resolveOgImage({ ...baseMeta, ogImage: 'https://cdn.example/x.png' })).toBe(
      'https://cdn.example/x.png',
    );
  });

  it('builds OG and Twitter tags including canonical og:url', () => {
    const tags = buildSocialMetaTags({
      ...baseMeta,
      ogImageAlt: 'Pricing preview',
      ogType: 'article',
    });
    const byKey = Object.fromEntries(tags.map((tag) => [tag.key, tag]));

    expect(byKey.description?.content).toBe(baseMeta.description);
    expect(byKey.robots?.content).toBe('index,follow');
    expect(byKey['og:title']?.content).toBe(baseMeta.title);
    expect(byKey['og:type']?.content).toBe('article');
    expect(byKey['og:site_name']?.content).toBe(SITE_NAME);
    expect(byKey['og:image:alt']?.content).toBe('Pricing preview');
    expect(byKey['og:url']?.content).toBe(baseMeta.canonical);
    expect(byKey['twitter:card']?.content).toBe('summary_large_image');
  });

  it('omits og:url when canonical is absent', () => {
    const { canonical: _canonical, ...withoutCanonical } = baseMeta;
    const tags = buildSocialMetaTags(withoutCanonical);
    expect(tags.some((tag) => tag.key === 'og:url')).toBe(false);
  });
});
