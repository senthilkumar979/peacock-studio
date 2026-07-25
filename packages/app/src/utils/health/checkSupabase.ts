import { isCloudSyncEnabled } from '@/cloud/config';
import { getCloudAuthContext, isCloudLibraryActive } from '@/cloud/authContext';
import { getSessionModeSnapshot } from '@/cloud/sessionState';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';
import { healthResult } from '@/utils/health/healthResult';
import type { HealthCheckResult } from '@/types/health';

export async function checkSupabase(): Promise<HealthCheckResult> {
  if (!isCloudSyncEnabled()) {
    return healthResult(
      'supabase',
      'connections',
      'Supabase API',
      'skip',
      'Skipped — cloud sync is not fully enabled.',
    );
  }

  if (getSessionModeSnapshot() !== 'cloud' || !isCloudLibraryActive()) {
    return healthResult(
      'supabase',
      'connections',
      'Supabase API',
      'skip',
      'Skipped — sign in and finish workspace setup to probe Supabase.',
    );
  }

  try {
    const client = getAuthenticatedSupabaseClient();
    const orgId = getCloudAuthContext()?.organizationId;
    if (!orgId) {
      return healthResult(
        'supabase',
        'connections',
        'Supabase API',
        'warn',
        'No active organization id in auth context.',
      );
    }
    const { error } = await client.from('organizations').select('id').eq('id', orgId).limit(1);
    if (error) {
      return healthResult(
        'supabase',
        'connections',
        'Supabase API',
        'fail',
        error.message || 'Supabase query failed.',
      );
    }
    return healthResult(
      'supabase',
      'connections',
      'Supabase API',
      'pass',
      'Authenticated query to organizations succeeded.',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return healthResult('supabase', 'connections', 'Supabase API', 'fail', message);
  }
}
