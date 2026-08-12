import * as Sentry from '@sentry/react';
import { trackException } from '@/analytics/analyticsClient';
import { isExpectedClientNoise, isSentryInitialized } from '@/observability/sentry';
import { isShareNotAllowedError } from '@/services/shareErrors';

export const GENERIC_USER_ERROR_MESSAGE =
  'Something went wrong. Please try again or refresh the page.';

export type AppErrorKind =
  | 'auth'
  | 'session'
  | 'network'
  | 'database'
  | 'permission'
  | 'validation'
  | 'not_found'
  | 'unknown';

export interface ClassifiedAppError {
  kind: AppErrorKind;
  /** Safe message to show the user */
  userMessage: string;
  /** Optional short title for toasts / error page */
  title: string;
  /** True when the UI should use the hard error page instead of a toast */
  isHard: boolean;
  /** Original error for logging */
  cause: unknown;
}

interface ErrorLike {
  code?: string | number;
  status?: number;
  statusCode?: number;
  message?: string;
  name?: string;
  details?: string;
  hint?: string;
}

function asErrorLike(error: unknown): ErrorLike {
  if (!error || typeof error !== 'object') {
    return { message: typeof error === 'string' ? error : undefined };
  }
  return error as ErrorLike;
}

function rawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  const like = asErrorLike(error);
  return like.message ?? like.details ?? '';
}

/**
 * Chromium quirk during layout churn (e.g. list unmount after delete).
 * Harmless — must not toast or escalate to hard error UI.
 */
const BENIGN_BROWSER_NOISE_RE =
  /ResizeObserver loop(?: completed with undelivered notifications| limit exceeded)?/i;

const CHUNK_LOAD_NOISE_RE =
  /ChunkLoadError|Loading chunk [\d]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

const SHARE_GATE_NOISE_RE =
  /publish this documentation to live|bot check failed|share link is invalid|link unavailable|share request failed \(429\)/i;

function isChunkLoadFailure(error: unknown, lower: string, name: string): boolean {
  if (name === 'ChunkLoadError') return true;
  return CHUNK_LOAD_NOISE_RE.test(lower);
}

/** Errors that should toast/warn but not reach Sentry or PostHog exception capture. */
export function shouldSkipErrorReporting(
  classified: ClassifiedAppError,
  error?: unknown,
): boolean {
  if (classified.isHard) return false;
  if (
    classified.kind === 'auth' ||
    classified.kind === 'session' ||
    classified.kind === 'network' ||
    classified.kind === 'not_found' ||
    classified.kind === 'validation'
  ) {
    return true;
  }
  if (error && (isShareNotAllowedError(error) || isExpectedClientNoise(error))) return true;
  if (isExpectedClientNoise(classified.userMessage)) return true;
  return false;
}

export function isBenignBrowserNoise(error: unknown): boolean {
  return BENIGN_BROWSER_NOISE_RE.test(rawMessage(error));
}

function isIndexedDbOpenFailure(error: unknown, lower: string, name: string): boolean {
  if (name === 'IndexedDBOpenError') return true;
  if (name === 'VersionError' || name === 'InvalidStateError') {
    return /indexeddb|idb|object store|database/i.test(lower);
  }
  return (
    /indexeddb open failed|failed to open.*indexeddb|indexeddb.*(?:blocked|corrupt|upgrade)|could not open.*(?:indexeddb|database)|idbopen/i.test(
      lower,
    )
  );
}

function isCorruptPayloadFailure(error: unknown, lower: string, name: string): boolean {
  if (name === 'CorruptDocumentPayloadError' || name === 'SyntaxError') {
    return (
      name === 'CorruptDocumentPayloadError' ||
      /json|unexpected token|unparseable|corrupt|malformed|payload|document/i.test(lower)
    );
  }
  return /corrupt(?:ed)?(?:\s+or\s+)?unparseable|unparseable document|malformed document|invalid document payload|corrupt.*payload/i.test(
    lower,
  );
}

/**
 * Maps unknown failures (API, DB, auth, validation, etc.) to a stable user-facing shape.
 */
export function classifyAppError(error: unknown): ClassifiedAppError {
  const like = asErrorLike(error);
  const message = rawMessage(error);
  const code = String(like.code ?? '');
  const status = Number(like.status ?? like.statusCode ?? NaN);
  const lower = message.toLowerCase();
  const name = like.name ?? (error instanceof Error ? error.name : '');

  if (isIndexedDbOpenFailure(error, lower, name)) {
    return {
      kind: 'database',
      title: 'Local library unavailable',
      userMessage:
        'Peacock could not open local browser storage. Check that IndexedDB is allowed for this site, then refresh.',
      isHard: true,
      cause: error,
    };
  }

  if (isCorruptPayloadFailure(error, lower, name)) {
    return {
      kind: 'validation',
      title: 'Documentation is unreadable',
      userMessage:
        'This documentation payload is corrupt or unreadable. Try another document, or restore from a share link if you have one.',
      isHard: true,
      cause: error,
    };
  }

  if (isShareNotAllowedError(error) || /publish this documentation to live/i.test(lower)) {
    return {
      kind: 'validation',
      title: 'Publish to Live first',
      userMessage:
        message || 'Publish this documentation to Live before sharing publicly.',
      isHard: false,
      cause: error,
    };
  }

  if (/bot check failed|share request failed \(429\)/i.test(lower)) {
    return {
      kind: 'validation',
      title: /429/.test(lower) ? 'Too many requests' : 'Bot check failed',
      userMessage:
        message ||
        (/429/.test(lower)
          ? 'Please wait a moment and try again.'
          : 'The bot check did not pass. Refresh the page and try again.'),
      isHard: false,
      cause: error,
    };
  }

  if (isChunkLoadFailure(error, lower, name)) {
    return {
      kind: 'network',
      title: 'Failed to load this page',
      userMessage:
        'A required code bundle did not load. Check your connection, then refresh.',
      isHard: false,
      cause: error,
    };
  }

  if (SHARE_GATE_NOISE_RE.test(lower)) {
    return {
      kind: 'not_found',
      title: 'Link unavailable',
      userMessage: message || 'This share link is invalid or has expired.',
      isHard: false,
      cause: error,
    };
  }

  if (
    status === 401 ||
    code === 'PGRST301' ||
    /jwt|unauthorized|not authenticated|invalid.*token|session.*expired|signed out/i.test(
      lower,
    )
  ) {
    return {
      kind: /expired|signed out/i.test(lower) ? 'session' : 'auth',
      title: /expired|signed out/i.test(lower) ? 'Session expired' : 'Authentication required',
      userMessage: /expired|signed out/i.test(lower)
        ? 'Your session expired. Please sign in again to continue.'
        : 'Please sign in again to continue.',
      isHard: false,
      cause: error,
    };
  }

  if (
    status === 403 ||
    code === '42501' ||
    /permission|not allowed|forbidden|do not have permission|only admins|row-level security/i.test(
      lower,
    )
  ) {
    return {
      kind: 'permission',
      title: 'Permission denied',
      userMessage:
        /row-level security/i.test(lower)
          ? 'Cloud could not save this row for your workspace. Refresh and try again, or check your member permissions.'
          : message || 'You do not have permission to do that in this workspace.',
      isHard: false,
      cause: error,
    };
  }

  if (/document limit reached|storage.*limit|quota/i.test(lower)) {
    return {
      kind: 'validation',
      title: 'Workspace limit',
      userMessage:
        message ||
        'This workspace has reached its documentation limit. Delete an unused doc or upgrade the plan.',
      isHard: false,
      cause: error,
    };
  }

  if (
    like.name === 'TitleVersionConflictError' ||
    /documentation named .+ with version .+ already exists|title.?version|flow_documents_org_title_version/i.test(
      lower,
    ) ||
    (code === '23505' && /title|version|flow_documents/i.test(lower))
  ) {
    return {
      kind: 'validation',
      title: 'Name already in use',
      userMessage:
        message ||
        'Another documentation already uses this title and version. Change the version, or save with the next free version on this documentation.',
      isHard: false,
      cause: error,
    };
  }

  if (
    status === 404 ||
    code === 'PGRST116' ||
    /not found|does not exist/i.test(lower)
  ) {
    return {
      kind: 'not_found',
      title: 'Not found',
      userMessage: message || 'We could not find what you were looking for.',
      isHard: false,
      cause: error,
    };
  }

  if (
    status === 400 ||
    status === 422 ||
    code === '23514' ||
    code === '23502' ||
    /required|invalid|validation|check constraint|already a member|valid email/i.test(lower)
  ) {
    return {
      kind: 'validation',
      title: 'Check your input',
      userMessage: message || 'Please check your entries and try again.',
      isHard: false,
      cause: error,
    };
  }

  if (
    code === '42P01' ||
    code === '23505' ||
    code === '57014' ||
    /postgres|database|relation .* does not exist|duplicate key|supabase/i.test(lower)
  ) {
    return {
      kind: 'database',
      title: 'Database error',
      userMessage:
        code === '42P01'
          ? 'Cloud database tables are missing. Apply the latest Supabase migrations, then try again.'
          : GENERIC_USER_ERROR_MESSAGE,
      isHard: false,
      cause: error,
    };
  }

  if (
    status >= 500 ||
    /failed to fetch|networkerror|network request failed|load failed|timeout|timed out|offline/i.test(
      lower,
    )
  ) {
    return {
      kind: 'network',
      title: 'Connection problem',
      userMessage: 'We could not reach the server. Check your connection and try again.',
      isHard: false,
      cause: error,
    };
  }

  return {
    kind: 'unknown',
    title: 'Something went wrong',
    userMessage: message && message.length < 180 ? message : GENERIC_USER_ERROR_MESSAGE,
    isHard: false,
    cause: error,
  };
}

export function toUserFacingMessage(error: unknown): string {
  return classifyAppError(error).userMessage;
}

export function logAppError(context: string, error: unknown): void {
  const classified = classifyAppError(error);

  if (shouldSkipErrorReporting(classified, error)) {
    console.warn(`[Peacock] ${context}`, error);
    return;
  }

  console.error(`[Peacock] ${context}`, error);

  // PostHog exception + Sentry only (skip duplicate exceptionCaptured event).
  trackException(error instanceof Error ? error : new Error(classified.userMessage), {
    peacock_context: context,
    peacock_error_kind: classified.kind,
    peacock_error_title: classified.title,
  });

  if (isSentryInitialized()) {
    Sentry.withScope((scope) => {
      scope.setTag('peacock.context', context);
      scope.setTag('peacock.error_kind', classified.kind);
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureException(new Error(classified.userMessage), {
          extra: { cause: error, context },
        });
      }
    });
  }
}

/**
 * Soft / intentional failures (analytics best-effort, expected handoff misses).
 * Console only — does not toast or send to Sentry/PostHog.
 */
export function logSoftFailure(context: string, error: unknown): void {
  console.warn(`[Peacock] ${context}`, error);
}

/** Log + classify; returns the user-facing message. */
export function reportAppError(context: string, error: unknown): ClassifiedAppError {
  logAppError(context, error);
  return classifyAppError(error);
}
