import { describe, expect, it } from 'vitest';
import { PEACOCK_APP_NAME } from '@/constants/branding';
import { DEFAULT_DOCUMENT_TITLE, DEFAULT_META_DESCRIPTION } from '@/constants/site';
import {
  isNoindexPath,
  landingJsonLd,
  marketingStaticMeta,
  NOINDEX_PREFIXES,
  titled,
  TITLE_SUFFIX,
} from './routeMetaData';

describe('routeMetaData', () => {
  it('builds titled page strings with the brand suffix', () => {
    expect(TITLE_SUFFIX).toContain(PEACOCK_APP_NAME);
    expect(titled('Pricing')).toBe(`Pricing${TITLE_SUFFIX}`);
  });

  it('detects noindex prefixes including nested paths', () => {
    expect(NOINDEX_PREFIXES).toContain('/dashboard');
    expect(isNoindexPath('/dashboard')).toBe(true);
    expect(isNoindexPath('/docs/abc')).toBe(true);
    expect(isNoindexPath('/pricing')).toBe(false);
  });

  it('returns static marketing meta with canonicals', () => {
    const home = marketingStaticMeta('/');
    expect(home).toEqual(
      expect.objectContaining({
        title: DEFAULT_DOCUMENT_TITLE,
        description: DEFAULT_META_DESCRIPTION,
        robots: 'index,follow',
        canonical: 'https://peacockstudio.app',
      }),
    );
    expect(home?.jsonLd).toBeDefined();

    const pricing = marketingStaticMeta('/pricing');
    expect(pricing?.title).toContain('Pricing');
    expect(pricing?.jsonLd).toBeUndefined();

    expect(marketingStaticMeta('/not-a-page')).toBeNull();
  });

  it('builds landing JSON-LD with Organization and SoftwareApplication', () => {
    const jsonLd = landingJsonLd() as {
      '@graph': Array<{ '@type': string; name?: string }>;
    };
    const types = jsonLd['@graph'].map((node) => node['@type']);
    expect(types).toEqual(
      expect.arrayContaining(['Organization', 'WebSite', 'SoftwareApplication']),
    );
    expect(jsonLd['@graph'][0]?.name).toBe(PEACOCK_APP_NAME);
  });
});
