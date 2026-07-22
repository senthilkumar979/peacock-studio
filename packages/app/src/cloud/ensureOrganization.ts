import { requireCloudAuthContext } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

export interface OrganizationRecord {
  id: string;
  ownerClerkUserId: string;
  name: string;
  plan: string;
  storageBytes: number;
  workspaceType: 'personal' | 'team';
  website: string | null;
}

/** Adjust storage bytes for the active organization. */
export async function adjustOrganizationStorageBytes(delta: number): Promise<void> {
  if (delta === 0) return;

  const { organizationId } = requireCloudAuthContext();
  const supabase = getAuthenticatedSupabaseClient();

  const { data, error: readError } = await supabase
    .from('organizations')
    .select('storage_bytes')
    .eq('id', organizationId)
    .single();

  if (readError) throw readError;

  const nextBytes = Math.max(0, Number(data.storage_bytes) + delta);

  const { error: updateError } = await supabase
    .from('organizations')
    .update({ storage_bytes: nextBytes, updated_at: new Date().toISOString() })
    .eq('id', organizationId);

  if (updateError) throw updateError;
}

export async function incrementOrganizationStorageBytes(delta: number): Promise<void> {
  if (delta <= 0) return;
  await adjustOrganizationStorageBytes(delta);
}
