import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchPageTitle } from './fetchPageTitle';

describe('fetchPageTitle', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the title from the page-title API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ title: 'Help Center' }), { status: 200 })),
    );
    await expect(fetchPageTitle('https://docs.example.com/help')).resolves.toBe('Help Center');
  });

  it('returns null when the API has no title or fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ title: null }), { status: 200 })),
    );
    await expect(fetchPageTitle('https://docs.example.com/help')).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })));
    await expect(fetchPageTitle('https://docs.example.com/help')).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline');
    }));
    await expect(fetchPageTitle('https://docs.example.com/help')).resolves.toBeNull();
  });
});
