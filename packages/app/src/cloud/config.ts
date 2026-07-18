const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

export function isCloudSyncEnabled(): boolean {
  const flag = import.meta.env.VITE_CLOUD_SYNC?.trim().toLowerCase();
  if (!flag || !TRUTHY.has(flag)) return false;

  return Boolean(
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() &&
      import.meta.env.VITE_SUPABASE_URL?.trim() &&
      import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getClerkPublishableKey(): string | undefined {
  return import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || undefined;
}

export function getSupabaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!url) throw new Error('VITE_SUPABASE_URL is not configured.');
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!key) throw new Error('VITE_SUPABASE_ANON_KEY is not configured.');
  return key;
}

export const SCREENSHOTS_BUCKET = 'screenshots' as const;
export const SIGNED_URL_TTL_SECONDS = 3600;
