const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

/** True when `VITE_CLOUD_SYNC` is set truthy, regardless of whether keys are present. */
export function isCloudSyncFlagEnabled(): boolean {
  const flag = import.meta.env.VITE_CLOUD_SYNC?.trim().toLowerCase();
  return Boolean(flag && TRUTHY.has(flag));
}

/**
 * Cloud sync is fully wired when the feature flag is on and Clerk + Supabase
 * publishable env vars are present (baked in at build time for Vite).
 */
export function isCloudSyncEnabled(): boolean {
  if (!isCloudSyncFlagEnabled()) return false;

  return Boolean(
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() &&
      import.meta.env.VITE_SUPABASE_URL?.trim() &&
      import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(),
  );
}

/** User-facing message when the cloud flag is on but required Vite env is incomplete. */
export function getCloudSyncMissingConfigMessage(): string | null {
  if (!isCloudSyncFlagEnabled()) return null;

  const missing: string[] = [];
  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim()) {
    missing.push('VITE_CLERK_PUBLISHABLE_KEY');
  }
  if (!import.meta.env.VITE_SUPABASE_URL?.trim()) {
    missing.push('VITE_SUPABASE_URL');
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }
  if (missing.length === 0) return null;

  return `Cloud sync is on, but this build is missing ${missing.join(', ')}. Set them in Vercel → Project → Settings → Environment Variables (Production), then redeploy.`;
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
