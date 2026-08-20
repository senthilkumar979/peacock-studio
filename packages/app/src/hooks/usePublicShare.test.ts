import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePublicShare } from './usePublicShare';

vi.mock('@/cloud/publicShareClient', () => ({
  resolvePublicShareLink: vi.fn(),
}));

vi.mock('@/cloud/publicShareContext', () => ({
  setPublicShareToken: vi.fn(),
}));

vi.mock('@/cloud/repositories/analyticsRepository', () => ({
  recordShareEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: vi.fn(() => true),
}));

vi.mock('@/hooks/useOrganization', () => ({
  useCloudAuthContext: vi.fn(() => null),
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'guest'),
}));

vi.mock('@/utils/referrer', () => ({
  getEmbedHostDomain: vi.fn(() => 'embed.example'),
  getReferrerDomain: vi.fn(() => 'ref.example'),
  getUtmParams: vi.fn(() => ({})),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: vi.fn((_c: string, err: unknown) => ({
    title: 'Resolve share link',
    userMessage: err instanceof Error ? err.message : String(err),
  })),
}));

import { resolvePublicShareLink } from '@/cloud/publicShareClient';
import { setPublicShareToken } from '@/cloud/publicShareContext';
import { recordShareEvent } from '@/cloud/repositories/analyticsRepository';
import { isCloudSyncEnabled } from '@/cloud/config';
import { useCloudAuthContext } from '@/hooks/useOrganization';
import { useSessionMode } from '@/hooks/useSessionMode';

describe('usePublicShare', () => {
  beforeEach(() => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    vi.mocked(useSessionMode).mockReturnValue('guest');
    vi.mocked(useCloudAuthContext).mockReturnValue(null);
    vi.mocked(resolvePublicShareLink).mockReset();
    vi.mocked(recordShareEvent).mockClear();
    vi.mocked(setPublicShareToken).mockClear();
  });

  it('errors when token missing', () => {
    const { result } = renderHook(() => usePublicShare(undefined));
    expect(result.current.errorTitle).toBe('Missing share link');
    expect(result.current.isLoading).toBe(false);
  });

  it('errors when cloud sync disabled', () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(false);
    const { result } = renderHook(() => usePublicShare('tok'));
    expect(result.current.errorTitle).toBe('Cloud sync required');
  });

  it('resolves public link and records share_view', async () => {
    vi.mocked(resolvePublicShareLink).mockResolvedValue({
      resourceId: 'doc-1',
      resourceType: 'document',
      requiresAuth: false,
      channel: 'link',
      settings: {},
    } as never);

    const { result } = renderHook(() => usePublicShare('tok-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.link?.resourceId).toBe('doc-1');
    expect(setPublicShareToken).toHaveBeenCalledWith('tok-1', 'share');
    expect(recordShareEvent).toHaveBeenCalledWith(
      'tok-1',
      'share_view',
      'ref.example',
      expect.any(Object),
    );
  });

  it('requires sign-in for auth-gated shares', async () => {
    vi.mocked(resolvePublicShareLink).mockResolvedValue({
      resourceId: 'doc-1',
      resourceType: 'document',
      requiresAuth: true,
      channel: 'link',
      settings: {},
    } as never);

    const { result } = renderHook(() => usePublicShare('secret'));
    await waitFor(() => expect(result.current.requiresSignIn).toBe(true));
    expect(result.current.link).toBeTruthy();
  });

  it('surfaces resolve errors', async () => {
    vi.mocked(resolvePublicShareLink).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => usePublicShare('bad'));
    await waitFor(() => expect(result.current.error).toBe('network'));
  });
});
