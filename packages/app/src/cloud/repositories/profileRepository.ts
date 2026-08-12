import { normalizeProfileEmail } from '@/cloud/audit';
import { requireCloudAuthSession } from '@/cloud/authContext';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

export interface UserProfile {
  email: string;
  clerkUserId: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
}

function mapProfileRow(row: {
  email: string;
  clerk_user_id: string;
  display_name: string;
  first_name?: string | null;
  last_name?: string | null;
}): UserProfile {
  return {
    email: row.email,
    clerkUserId: row.clerk_user_id,
    displayName: row.display_name,
    firstName: row.first_name?.trim() || null,
    lastName: row.last_name?.trim() || null,
  };
}

export async function upsertUserProfile(input: {
  email: string;
  clerkUserId: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
}): Promise<UserProfile> {
  const supabase = getAuthenticatedSupabaseClient();
  const email = normalizeProfileEmail(input.email);
  const firstName = input.firstName?.trim() || null;
  const lastName = input.lastName?.trim() || null;
  const displayName =
    input.displayName.trim() ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    email;
  const now = new Date().toISOString();

  // PK is email — upsert on email so re-signup with the same address updates the row
  // instead of failing duplicate key on user_profiles_pkey.
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        email,
        clerk_user_id: input.clerkUserId,
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
        updated_at: now,
      },
      { onConflict: 'email' },
    )
    .select('email, clerk_user_id, display_name, first_name, last_name')
    .single();

  if (error) throw error;

  return mapProfileRow(data);
}

/** Map of clerk_user_id → profile (for roster email/name resolution). */
export async function fetchProfilesByClerkUserIds(
  clerkUserIds: Array<string | null | undefined>,
): Promise<Record<string, UserProfile>> {
  const unique = [
    ...new Set(
      clerkUserIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (unique.length === 0) return {};

  try {
    requireCloudAuthSession();
  } catch {
    return {};
  }

  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email, clerk_user_id, display_name, first_name, last_name')
    .in('clerk_user_id', unique);

  if (error) throw error;

  const map: Record<string, UserProfile> = {};
  for (const row of data ?? []) {
    map[row.clerk_user_id as string] = mapProfileRow(
      row as {
        email: string;
        clerk_user_id: string;
        display_name: string;
        first_name?: string | null;
        last_name?: string | null;
      },
    );
  }
  return map;
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
