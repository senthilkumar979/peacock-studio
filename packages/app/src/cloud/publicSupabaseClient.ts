import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/cloud/config';

let anonClient: SupabaseClient | null = null;

export function getPublicSupabaseClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return anonClient;
}
