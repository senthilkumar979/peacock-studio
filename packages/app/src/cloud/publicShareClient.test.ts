import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCloudAuthContext = vi.fn<any>(() => null);
const getSupabaseUrl = vi.fn(() => 'https://proj.supabase.co');
const getSupabaseAnonKey = vi.fn(() => 'anon-key');
const getTurnstileToken = vi.fn(async () => 'turnstile');
const isPublicShareEmbed = vi.fn(() => false);
const rpc = vi.fn();

vi.mock('@/cloud/authContext', () => ({
  getCloudAuthContext: () => getCloudAuthContext(),
}));

vi.mock('@/cloud/config', () => ({
  getSupabaseUrl: () => getSupabaseUrl(),
  getSupabaseAnonKey: () => getSupabaseAnonKey(),
}));

vi.mock('@/security/turnstile', () => ({
  getTurnstileToken: (...args: any[]) => (getTurnstileToken as any)(...args),
}));

vi.mock('@/cloud/publicShareContext', () => ({
  isPublicShareEmbed: () => isPublicShareEmbed(),
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ rpc }),
}));

vi.mock('@/utils/normalizePersona', () => ({
  normalizePersona: (input: unknown) => input,
}));

vi.mock('@/utils/normalizeProductTour', () => ({
  normalizeProductTour: (input: unknown) => input,
}));

vi.mock('@/utils/flowDocumentMeta', () => ({
  normalizeFlowStatus: (status: unknown, fallback: string) => status ?? fallback,
}));

import {
  fetchPublicFlowDocument,
  fetchPublicPersona,
  fetchPublicProductTour,
  getResolveShareUrl,
  resolvePublicShareLink,
  verifyEditableShareLink,
} from './publicShareClient';

describe('publicShareClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCloudAuthContext.mockReturnValue(null);
    isPublicShareEmbed.mockReturnValue(false);
    getTurnstileToken.mockResolvedValue('turnstile');
    vi.stubGlobal('window', { location: { origin: 'https://peacockstudio.app' } });
  });

  function mockFetchOk(data: unknown, status = 200) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({ data }),
    } as Response);
  }

  it('getResolveShareUrl uses first-party proxy in production browser', () => {
    vi.stubGlobal('window', { location: { origin: 'https://peacockstudio.app' } });
    expect(getResolveShareUrl()).toBe('https://peacockstudio.app/api/resolve-share');
  });

  it('getResolveShareUrl uses direct Supabase on localhost dev', () => {
    vi.stubGlobal('window', { location: { origin: 'http://localhost:5173' } });
    expect(getResolveShareUrl()).toBe('https://proj.supabase.co/functions/v1/resolve-share');
  });

  it('resolvePublicShareLink maps payload and uses anon key', async () => {
    mockFetchOk({
      token: 't',
      organizationId: 'o',
      resourceType: 'document',
      resourceId: 'd',
      accessMode: 'readonly',
      channel: 'link',
      settings: {},
      requiresAuth: false,
      expiresAt: null,
    });

    const link = await resolvePublicShareLink('tok');
    expect(link?.token).toBe('t');
    expect(fetch).toHaveBeenCalledWith(
      'https://peacockstudio.app/api/resolve-share',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer anon-key',
          apikey: 'anon-key',
        }),
      }),
    );
  });

  it('skips turnstile for embed and uses session token when present', async () => {
    isPublicShareEmbed.mockReturnValue(true);
    getCloudAuthContext.mockReturnValue({
      getAccessToken: async () => 'session-tok',
    });
    mockFetchOk(null);
    await expect(resolvePublicShareLink('tok')).resolves.toBeNull();
    expect(getTurnstileToken).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer session-tok' }),
        body: expect.stringContaining('"presentation":"embed"'),
      }),
    );
  });

  it('maps HTTP errors including 429 and bot check', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'slow down' }),
    } as Response);
    await expect(resolvePublicShareLink('t')).rejects.toThrow(/slow down/);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Bot check failed' }),
    } as Response);
    await expect(resolvePublicShareLink('t')).rejects.toThrow(/Bot check failed/);

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Failed to fetch'));
    await expect(resolvePublicShareLink('t')).rejects.toThrow(/Failed to fetch/);
  });

  it('fetchPublicFlowDocument returns undefined for auth gate and maps resources', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { requiresAuth: true } }),
      } as Response);
    await expect(fetchPublicFlowDocument('t', 'd')).resolves.toBeUndefined();

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            id: 'd',
            savedAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
            status: 'live',
            flow: { flow: { title: 'T' } },
            steps: [],
            stepResources: [{ id: 'r1' }],
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { shot: 'https://signed' } }),
      } as Response);

    const doc = await fetchPublicFlowDocument('t', 'd');
    expect(doc?.id).toBe('d');
    expect(doc?.screenshotUrls).toEqual({ shot: 'https://signed' });
    expect(doc?.stepResources).toEqual([{ id: 'r1' }]);
  });

  it('fetchPublicProductTour and fetchPublicPersona normalize payloads', async () => {
    mockFetchOk({
      id: 'tour',
      title: 'Tour',
      description: '',
      status: 'draft',
      personaId: 'p',
      tourGoal: '',
      features: [],
      createdAt: 1,
      updatedAt: 2,
    });
    await expect(fetchPublicProductTour('t')).resolves.toMatchObject({ id: 'tour' });

    mockFetchOk({
      id: 'p',
      name: 'N',
      occupation: 'O',
      shortBio: 'B',
      gender: 'unspecified',
      avatarId: 'a',
      createdAt: 1,
      updatedAt: 2,
    });
    await expect(fetchPublicPersona('t', 'p')).resolves.toMatchObject({ id: 'p' });
  });

  it('verifyEditableShareLink maps rpc result', async () => {
    rpc.mockResolvedValue({
      data: {
        resourceType: 'document',
        resourceId: 'd',
        organizationId: 'o',
      },
      error: null,
    });
    await expect(verifyEditableShareLink('tok')).resolves.toEqual({
      resourceType: 'document',
      resourceId: 'd',
      organizationId: 'o',
    });

    rpc.mockResolvedValue({ data: null, error: null });
    await expect(verifyEditableShareLink('tok')).resolves.toBeNull();

    rpc.mockResolvedValue({ data: null, error: { message: 'nope' } });
    await expect(verifyEditableShareLink('tok')).rejects.toEqual({ message: 'nope' });
  });
});
