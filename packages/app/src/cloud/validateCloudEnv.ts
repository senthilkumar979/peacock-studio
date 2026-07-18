function hasQuotes(value: string): boolean {
  return (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  );
}

/** Returns a user-facing message when cloud env vars look misconfigured. */
export function getCloudEnvValidationError(): string | null {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (!clerkKey) {
    return 'VITE_CLERK_PUBLISHABLE_KEY is missing. Copy the publishable key from Clerk → API keys.';
  }
  if (hasQuotes(clerkKey)) {
    return 'Remove quotes around VITE_CLERK_PUBLISHABLE_KEY in .env.local.';
  }
  if (!clerkKey.startsWith('pk_test_') && !clerkKey.startsWith('pk_live_')) {
    return 'VITE_CLERK_PUBLISHABLE_KEY must start with pk_test_ or pk_live_ (not the secret key).';
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return 'VITE_SUPABASE_URL is missing. Use Project Settings → Data API → Project URL.';
  }
  if (hasQuotes(supabaseUrl)) {
    return 'Remove quotes around VITE_SUPABASE_URL in .env.local.';
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl)) {
    return 'VITE_SUPABASE_URL must look like https://your-project-ref.supabase.co (no /rest/v1 path).';
  }

  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!supabaseKey) {
    return 'VITE_SUPABASE_ANON_KEY is missing. Copy the publishable/anon key from Supabase → Project Settings → API keys.';
  }
  if (hasQuotes(supabaseKey)) {
    return 'Remove quotes around VITE_SUPABASE_ANON_KEY in .env.local.';
  }
  if (supabaseKey.startsWith('sb_secret_') || supabaseKey.includes('service_role')) {
    return 'Never use the Supabase secret/service role key in the browser. Use the publishable (anon) key instead.';
  }
  const isLegacyAnonJwt = supabaseKey.startsWith('eyJ');
  const isPublishableKey = supabaseKey.startsWith('sb_publishable_');
  if (!isLegacyAnonJwt && !isPublishableKey) {
    return 'VITE_SUPABASE_ANON_KEY must be the Supabase publishable key (sb_publishable_…) or legacy anon JWT (eyJ…).';
  }

  return null;
}
