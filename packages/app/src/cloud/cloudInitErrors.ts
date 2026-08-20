export type CloudInitErrorKind = 'network_blocked' | 'auth' | 'migration' | 'unknown';

export interface ClassifiedCloudInitError {
  kind: CloudInitErrorKind;
  title: string;
  message: string;
  workarounds: string[];
}

export const CLOUD_NETWORK_BLOCKED_WORKAROUNDS = [
  'Continue with your local guest library — recording and editing still work offline in this browser.',
  'Try a personal device or home network (mobile hotspot) to confirm cloud sync works elsewhere.',
  'Ask IT to allowlist peacockstudio.app, *.supabase.co, *.clerk.com, and clerk.peacockstudio.app.',
  'Use an approved VPN if your company permits it.',
] as const;

interface SupabaseLikeError {
  code?: string;
  message?: string;
  name?: string;
}

function asErrorLike(error: unknown): SupabaseLikeError {
  if (!error || typeof error !== 'object') {
    return { message: typeof error === 'string' ? error : undefined };
  }
  return error as SupabaseLikeError;
}

function rawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return asErrorLike(error).message ?? '';
}

function isAtobDecodeError(error: unknown): boolean {
  const record = asErrorLike(error);
  const message = record.message ?? rawMessage(error);
  const name = record.name ?? (error instanceof Error ? error.name : '');

  return (
    name === 'InvalidCharacterError' ||
    /atob|not correctly encoded|invalid character/i.test(message)
  );
}

function isNetworkBlockedError(error: unknown): boolean {
  const record = asErrorLike(error);
  const message = rawMessage(error);
  const lower = message.toLowerCase();
  const name = record.name ?? (error instanceof Error ? error.name : '');
  const status = Number(
    (error as { status?: number; statusCode?: number })?.status
      ?? (error as { status?: number; statusCode?: number })?.statusCode
      ?? NaN,
  );

  if (status >= 502 && status <= 504) return true;

  return (
    name === 'TypeError' && /failed to fetch/i.test(message)
  ) || /failed to fetch|networkerror|network request failed|load failed|timeout|timed out|offline|upstream unavailable|upstream fetch failed/i.test(
    lower,
  );
}

export function classifyCloudInitError(error: unknown): ClassifiedCloudInitError {
  const record = asErrorLike(error);
  const code = record.code;
  const status = Number(
    (error as { status?: number; statusCode?: number })?.status
      ?? (error as { status?: number; statusCode?: number })?.statusCode
      ?? NaN,
  );
  const message = rawMessage(error);

  if (isNetworkBlockedError(error)) {
    return {
      kind: 'network_blocked',
      title: 'Company network may be blocking cloud sync',
      message:
        'Peacock could not reach its cloud servers from this browser. Some company networks block services like Supabase and Clerk (similar to Firebase).',
      workarounds: [...CLOUD_NETWORK_BLOCKED_WORKAROUNDS],
    };
  }

  if (isAtobDecodeError(error)) {
    return {
      kind: 'auth',
      title: 'Cloud setup incomplete',
      message:
        'Could not decode an auth or API key. Check packages/app/.env.local: VITE_CLERK_PUBLISHABLE_KEY must be pk_test_… or pk_live_…, and VITE_SUPABASE_ANON_KEY must be your Supabase publishable/anon key — no quotes, no secret key. Then complete Clerk ↔ Supabase third-party auth setup.',
      workarounds: [],
    };
  }

  if (code === 'PGRST301' || status === 401 || /jwt|invalid.*token|not authenticated/i.test(message)) {
    return {
      kind: 'auth',
      title: 'Authentication required',
      message:
        'Supabase rejected the Clerk session token. Connect Clerk and Supabase: in Clerk, activate the Supabase integration (adds the role claim to tokens); in Supabase, add Clerk under Authentication → Third-party auth. Then sign out and sign back in.',
      workarounds: [],
    };
  }

  if (code === '42P01') {
    return {
      kind: 'migration',
      title: 'Database migration required',
      message: 'Cloud database tables are missing. Apply the Supabase migrations in supabase/migrations/.',
      workarounds: [],
    };
  }

  if (code === '23505' && record.message?.includes('screenshot_assets_org_hash_uidx')) {
    return {
      kind: 'migration',
      title: 'Database migration required',
      message:
        'Screenshot sync failed due to an outdated database constraint. Run supabase db push to apply the latest migrations (screenshot_assets_hash_index), then try again.',
      workarounds: [],
    };
  }

  if (message) {
    return {
      kind: 'unknown',
      title: 'Cloud library unavailable',
      message,
      workarounds: [],
    };
  }

  return {
    kind: 'unknown',
    title: 'Cloud library unavailable',
    message: 'Could not connect your cloud library. Check Clerk, Supabase, and migration setup.',
    workarounds: [],
  };
}

/** @deprecated Prefer classifyCloudInitError for structured UI. */
export function getCloudInitErrorMessage(error: unknown): string {
  return classifyCloudInitError(error).message;
}

export function isCloudNetworkBlockedError(error: unknown): boolean {
  return classifyCloudInitError(error).kind === 'network_blocked';
}

export function getCloudInitErrorDetailSnapshotKind(
  detail: ClassifiedCloudInitError | null,
): CloudInitErrorKind | null {
  return detail?.kind ?? null;
}
