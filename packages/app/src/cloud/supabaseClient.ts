import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/cloud/config';
import { requireCloudAuthContext } from '@/cloud/authContext';

let cachedClient: SupabaseClient | null = null;
let cachedTokenUserId: string | null = null;

export function createAuthenticatedSupabaseClient(
  getAccessToken: () => Promise<string | null>,
): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    accessToken: getAccessToken,
  });
}

export function getAuthenticatedSupabaseClient(): SupabaseClient {
  const { clerkUserId, getAccessToken } = requireCloudAuthContext();

  if (!cachedClient || cachedTokenUserId !== clerkUserId) {
    cachedClient = createAuthenticatedSupabaseClient(getAccessToken);
    cachedTokenUserId = clerkUserId;
  }

  return cachedClient;
}

export function resetSupabaseClientCache(): void {
  cachedClient = null;
  cachedTokenUserId = null;
}
