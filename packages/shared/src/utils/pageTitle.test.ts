import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities, extractHtmlPageTitle, isPublicHttpUrl } from './pageTitle';

describe('extractHtmlPageTitle', () => {
  it('prefers og:title over the document title', () => {
    expect(
      extractHtmlPageTitle(`
        <html>
          <head>
            <title>Fallback</title>
            <meta property="og:title" content="Onboarding Guide" />
          </head>
        </html>
      `),
    ).toBe('Onboarding Guide');
  });

  it('reads twitter:title and title tags, decoding entities', () => {
    expect(
      extractHtmlPageTitle('<meta name="twitter:title" content="Docs &amp; Help">'),
    ).toBe('Docs & Help');
    expect(extractHtmlPageTitle('<title>  Hello&#x20;World  </title>')).toBe('Hello World');
  });

  it('returns null when no usable title exists', () => {
    expect(extractHtmlPageTitle('<html><body>no title</body></html>')).toBeNull();
    expect(extractHtmlPageTitle('<title>   </title>')).toBeNull();
  });
});

describe('decodeHtmlEntities', () => {
  it('decodes named, decimal, and hex entities', () => {
    expect(decodeHtmlEntities('A&nbsp;B &#39;quote&#x27;')).toBe("A B 'quote'");
  });
});

describe('isPublicHttpUrl', () => {
  it('allows public https URLs', () => {
    expect(isPublicHttpUrl('https://docs.example.com/guide')).toBe(true);
  });

  it('rejects private, local, and non-http URLs', () => {
    expect(isPublicHttpUrl('http://localhost/docs')).toBe(false);
    expect(isPublicHttpUrl('http://127.0.0.1/')).toBe(false);
    expect(isPublicHttpUrl('http://192.168.1.4/')).toBe(false);
    expect(isPublicHttpUrl('http://10.0.0.8/x')).toBe(false);
    expect(isPublicHttpUrl('http://169.254.169.254/latest')).toBe(false);
    expect(isPublicHttpUrl('ftp://example.com')).toBe(false);
    expect(isPublicHttpUrl('not-a-url')).toBe(false);
  });
});
