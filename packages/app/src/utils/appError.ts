import * as Sentry from '@sentry/react';
import { trackEvent, trackException } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { isSentryInitialized } from '@/observability/sentry';

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

export function isBenignBrowserNoise(error: unknown): boolean {
  return BENIGN_BROWSER_NOISE_RE.test(rawMessage(error));
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
    /permission|not allowed|forbidden|do not have permission|only admins/i.test(lower)
  ) {
    return {
      kind: 'permission',
      title: 'Permission denied',
      userMessage: message || 'You do not have permission to do that in this workspace.',
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
  console.error(`[Peacock] ${context}`, error);
  const classified = classifyAppError(error);

  trackException(error instanceof Error ? error : new Error(classified.userMessage), {
    peacock_context: context,
    peacock_error_kind: classified.kind,
  });
  trackEvent(AnalyticsEvents.exceptionCaptured, {
    context,
    kind: classified.kind,
    title: classified.title,
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

/** Log + classify; returns the user-facing message. */
export function reportAppError(context: string, error: unknown): ClassifiedAppError {
  logAppError(context, error);
  return classifyAppError(error);
}
