interface SupabaseLikeError {
  code?: string;
  message?: string;
  name?: string;
}

function isAtobDecodeError(error: unknown): boolean {
  const record = error as SupabaseLikeError;
  const message = record?.message ?? (error instanceof Error ? error.message : String(error));
  const name = record?.name ?? (error instanceof Error ? error.name : '');

  return (
    name === 'InvalidCharacterError' ||
    /atob|not correctly encoded|invalid character/i.test(message)
  );
}

export function getCloudInitErrorMessage(error: unknown): string {
  const record = error as SupabaseLikeError;
  const code = record?.code;

  if (isAtobDecodeError(error)) {
    return 'Could not decode an auth or API key. Check packages/app/.env.local: VITE_CLERK_PUBLISHABLE_KEY must be pk_test_… or pk_live_…, and VITE_SUPABASE_ANON_KEY must be your Supabase publishable/anon key — no quotes, no secret key. Then complete Clerk ↔ Supabase third-party auth setup.';
  }

  if (code === 'PGRST301') {
    return 'Supabase rejected the Clerk session token. Connect Clerk and Supabase: in Clerk, activate the Supabase integration (adds the role claim to tokens); in Supabase, add Clerk under Authentication → Third-party auth.';
  }

  if (code === '42P01') {
    return 'Cloud database tables are missing. Apply the Supabase migrations in supabase/migrations/.';
  }

  if (record?.message) {
    return record.message;
  }

  return 'Could not connect your cloud library. Check Clerk, Supabase, and migration setup.';
}
