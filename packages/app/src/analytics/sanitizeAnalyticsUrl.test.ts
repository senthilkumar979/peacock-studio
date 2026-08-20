import { describe, expect, it } from 'vitest';
import { sanitizeAnalyticsUrl } from './sanitizeAnalyticsUrl';

describe('sanitizeAnalyticsUrl', () => {
  it('redacts share tokens and document ids from relative paths', () => {
    expect(sanitizeAnalyticsUrl('/s/abc.token-xyz')).toBe('/s/[token]');
    expect(sanitizeAnalyticsUrl('/docs/550e8400-e29b-41d4-a716-446655440000')).toBe(
      '/docs/[id]',
    );
    expect(sanitizeAnalyticsUrl('/tours/tour-1/edit')).toBe('/tours/[id]/edit');
    expect(sanitizeAnalyticsUrl('/capture/cap-9')).toBe('/capture/[id]');
  });

  it('preserves absolute origins while redacting the path', () => {
    expect(sanitizeAnalyticsUrl('https://peacockstudio.app/s/secret-token?x=1')).toBe(
      'https://peacockstudio.app/s/[token]?x=1',
    );
  });

  it('leaves marketing paths unchanged', () => {
    expect(sanitizeAnalyticsUrl('/pricing')).toBe('/pricing');
    expect(sanitizeAnalyticsUrl('/products/flow-documents#demo')).toBe(
      '/products/flow-documents#demo',
    );
  });

  it('falls back for unparseable input', () => {
    expect(sanitizeAnalyticsUrl('/s/raw-token')).toBe('/s/[token]');
  });
});
