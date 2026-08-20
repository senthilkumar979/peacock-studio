import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpcPublic = vi.fn();
const rpcAuth = vi.fn();
const getCloudAuthContext = vi.fn<any>(() => ({ organizationId: 'org-1' }));
const logSoftFailure = vi.fn();

vi.mock('@/cloud/publicSupabaseClient', () => ({
  getPublicSupabaseClient: () => ({ rpc: rpcPublic }),
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ rpc: rpcAuth }),
}));

vi.mock('@/cloud/authContext', () => ({
  getCloudAuthContext: () => getCloudAuthContext(),
}));

vi.mock('@/utils/appError', () => ({
  logSoftFailure: (...args: any[]) => (logSoftFailure as any)(...args),
}));

vi.mock('@/types/analytics', async () => {
  const actual = await vi.importActual<typeof import('@/types/analytics')>('@/types/analytics');
  return actual;
});

import {
  fetchOrgAnalyticsSummary,
  recordOrgEvent,
  recordShareEvent,
} from './analyticsRepository';
import { EMPTY_ANALYTICS_SUMMARY } from '@/types/analytics';

describe('analyticsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCloudAuthContext.mockReturnValue({ organizationId: 'org-1' });
  });

  it('recordShareEvent best-effort rpc', async () => {
    rpcPublic.mockResolvedValue({ data: null, error: null });
    await recordShareEvent('tok', 'share_view', 'example.com', { a: 1 });
    expect(rpcPublic).toHaveBeenCalledWith('record_share_event', {
      p_token: 'tok',
      p_event_type: 'share_view',
      p_referrer_domain: 'example.com',
      p_metadata: { a: 1 },
    });

    rpcPublic.mockRejectedValue(new Error('net'));
    await recordShareEvent('tok', 'share_view', null);
    expect(logSoftFailure).toHaveBeenCalled();
  });

  it('recordOrgEvent no-ops without context and swallows errors', async () => {
    getCloudAuthContext.mockReturnValue(null);
    await recordOrgEvent('pdf_export');
    expect(rpcAuth).not.toHaveBeenCalled();

    getCloudAuthContext.mockReturnValue({ organizationId: 'org-1' });
    rpcAuth.mockRejectedValue(new Error('x'));
    await recordOrgEvent('pdf_export', { resourceId: 'd1' });
    expect(logSoftFailure).toHaveBeenCalled();
  });

  it('fetchOrgAnalyticsSummary returns empty on inactive/error', async () => {
    getCloudAuthContext.mockReturnValue(null);
    await expect(fetchOrgAnalyticsSummary()).resolves.toEqual(EMPTY_ANALYTICS_SUMMARY);

    getCloudAuthContext.mockReturnValue({ organizationId: 'org-1' });
    rpcAuth.mockResolvedValue({ data: null, error: { message: 'missing' } });
    await expect(fetchOrgAnalyticsSummary(7)).resolves.toEqual(EMPTY_ANALYTICS_SUMMARY);

    rpcAuth.mockResolvedValue({ data: { totalViews: 3 }, error: null });
    await expect(fetchOrgAnalyticsSummary()).resolves.toEqual({ totalViews: 3 });

    rpcAuth.mockRejectedValue(new Error('boom'));
    await expect(fetchOrgAnalyticsSummary()).resolves.toEqual(EMPTY_ANALYTICS_SUMMARY);
  });
});
