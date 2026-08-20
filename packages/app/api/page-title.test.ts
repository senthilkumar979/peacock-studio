import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './page-title';

describe('page-title API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects private and invalid URLs', async () => {
    const blocked = await GET(
      new Request('https://peacockstudio.app/api/page-title?url=http://127.0.0.1/'),
    );
    expect(blocked.status).toBe(400);

    const missing = await GET(new Request('https://peacockstudio.app/api/page-title'));
    expect(missing.status).toBe(400);
  });

  it('returns the extracted page title', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response('<html><head><title>Help Center</title></head></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
      ),
    );

    const response = await GET(
      new Request('https://peacockstudio.app/api/page-title?url=https://docs.example.com/help'),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ title: 'Help Center' });
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://docs.example.com/help',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
        }),
      }),
    );
  });

  it('returns a null title when the upstream page cannot be read', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })));

    const response = await GET(
      new Request('https://peacockstudio.app/api/page-title?url=https://docs.example.com/help'),
    );
    await expect(response.json()).resolves.toEqual({ title: null });
  });
});
