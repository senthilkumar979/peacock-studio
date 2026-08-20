import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyMetaTags,
  removeJsonLd,
  setDocumentTitle,
  upsertJsonLd,
  upsertLink,
  upsertMeta,
} from './applyHeadMeta';

describe('applyHeadMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('sets the document title', () => {
    setDocumentTitle('Hello');
    expect(document.title).toBe('Hello');
  });

  it('creates and updates meta tags', () => {
    upsertMeta('name', 'description', 'first');
    upsertMeta('name', 'description', 'second');
    upsertMeta('property', 'og:title', 'Title');

    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(description?.getAttribute('content')).toBe('second');
    expect(ogTitle?.getAttribute('content')).toBe('Title');
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });

  it('creates and updates link tags', () => {
    upsertLink('canonical', 'https://peacockstudio.app/pricing');
    upsertLink('canonical', 'https://peacockstudio.app/');
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    expect(link?.href).toBe('https://peacockstudio.app/');
  });

  it('upserts and removes JSON-LD scripts', () => {
    upsertJsonLd('peacock-landing-jsonld', { '@type': 'WebSite' });
    const script = document.getElementById('peacock-landing-jsonld') as HTMLScriptElement;
    expect(script.type).toBe('application/ld+json');
    expect(JSON.parse(script.textContent ?? '')).toEqual({ '@type': 'WebSite' });

    removeJsonLd('peacock-landing-jsonld');
    expect(document.getElementById('peacock-landing-jsonld')).toBeNull();
  });

  it('applies a batch of meta tags', () => {
    applyMetaTags([
      { attr: 'name', key: 'robots', content: 'index,follow' },
      { attr: 'property', key: 'og:locale', content: 'en_US' },
    ]);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'index,follow',
    );
    expect(
      document.querySelector('meta[property="og:locale"]')?.getAttribute('content'),
    ).toBe('en_US');
  });
});
