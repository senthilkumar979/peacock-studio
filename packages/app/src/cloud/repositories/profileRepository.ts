import { normalizeProfileEmail } from '@/cloud/audit';
import { requireCloudAuthSession } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

export interface UserProfile {
  email: string;
  clerkUserId: string;
  displayName: string;
}

export async function upsertUserProfile(input: {
  email: string;
  clerkUserId: string;
  displayName: string;
}): Promise<UserProfile> {
  const supabase = getAuthenticatedSupabaseClient();
  const email = normalizeProfileEmail(input.email);
  const displayName = input.displayName.trim() || email;
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        email,
        clerk_user_id: input.clerkUserId,
        display_name: displayName,
        updated_at: now,
      },
      { onConflict: 'email' },
    )
    .select('email, clerk_user_id, display_name')
    .single();

  if (error) throw error;

  return {
    email: data.email,
    clerkUserId: data.clerk_user_id,
    displayName: data.display_name,
  };
}

/** Map of lowercased email → display name. */
export async function fetchDisplayNamesByEmail(
  emails: Array<string | null | undefined>,
): Promise<Record<string, string>> {
  const unique = [
    ...new Set(
      emails
        .map((email) => email?.trim())
        .filter((email): email is string => Boolean(email))
        .map(normalizeProfileEmail),
    ),
  ];

  if (unique.length === 0) return {};

  // Cloud inactive (guest) or still onboarding: nothing to resolve.
  try {
    requireCloudAuthSession();
  } catch {
    return {};
  }

  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email, display_name')
    .in('email', unique);

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.email as string] = row.display_name as string;
  }
  return map;
}
