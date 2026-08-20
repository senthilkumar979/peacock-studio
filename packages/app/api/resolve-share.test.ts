import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OPTIONS, POST } from './resolve-share';

describe('resolve-share API proxy', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://proj.supabase.co';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('OPTIONS returns CORS preflight', async () => {
    const response = await OPTIONS(
      new Request('https://peacockstudio.app/api/resolve-share', {
        method: 'OPTIONS',
        headers: { Origin: 'https://peacockstudio.app' },
      }),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('POST forwards body and auth headers to Supabase', async () => {
    const upstream = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { token: 't' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await POST(
      new Request('https://peacockstudio.app/api/resolve-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'anon-key',
          Authorization: 'Bearer anon-key',
        },
        body: JSON.stringify({ action: 'resolve', token: 'abc' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { token: 't' } });
    expect(upstream).toHaveBeenCalledWith(
      'https://proj.supabase.co/functions/v1/resolve-share',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          apikey: 'anon-key',
          Authorization: 'Bearer anon-key',
        }),
        body: JSON.stringify({ action: 'resolve', token: 'abc' }),
      }),
    );
  });

  it('returns 400 when auth headers are missing', async () => {
    const response = await POST(
      new Request('https://peacockstudio.app/api/resolve-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 502 when upstream fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('blocked'));
    const response = await POST(
      new Request('https://peacockstudio.app/api/resolve-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'anon-key',
          Authorization: 'Bearer anon-key',
        },
        body: '{}',
      }),
    );
    expect(response.status).toBe(502);
  });
});
