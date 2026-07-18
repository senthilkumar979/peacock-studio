import { requireCloudAuthContext } from '@/cloud/authContext';
import { createAuthenticatedSupabaseClient, getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

export interface OrganizationRecord {
  id: string;
  clerkUserId: string;
  name: string;
  plan: string;
  storageBytes: number;
}

export async function ensureOrganization(
  clerkUserId: string,
  getAccessToken: () => Promise<string | null>,
  displayName?: string | null,
): Promise<OrganizationRecord> {
  const supabase = createAuthenticatedSupabaseClient(getAccessToken);

  const { data: existing, error: selectError } = await supabase
    .from('organizations')
    .select('id, clerk_user_id, name, plan, storage_bytes')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    return mapOrganization(existing);
  }

  const workspaceName = displayName?.trim()
    ? `${displayName.trim()}'s workspace`
    : 'Personal workspace';

  const { data: created, error: insertError } = await supabase
    .from('organizations')
    .insert({
      clerk_user_id: clerkUserId,
      name: workspaceName,
    })
    .select('id, clerk_user_id, name, plan, storage_bytes')
    .single();

  if (insertError) throw insertError;

  return mapOrganization(created);
}

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

function mapOrganization(row: {
  id: string;
  clerk_user_id: string;
  name: string;
  plan: string;
  storage_bytes: number;
}): OrganizationRecord {
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    name: row.name,
    plan: row.plan,
    storageBytes: Number(row.storage_bytes),
  };
}
