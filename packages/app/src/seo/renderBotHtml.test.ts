import { describe, expect, it } from 'vitest';
import { renderBotHtml } from '@/seo/renderBotHtml';
import { resolveRouteMeta } from '@/seo/resolveRouteMeta';

describe('renderBotHtml', () => {
  it('renders escaped title and OG tags for crawlers', () => {
    const meta = resolveRouteMeta('/pricing');
    const html = renderBotHtml(meta);

    expect(html).toContain('<title>Pricing');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card"');
    expect(html).not.toContain('<script');
  });
});
