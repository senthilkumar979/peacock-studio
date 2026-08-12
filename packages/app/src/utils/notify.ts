import { gooeyToast } from 'goey-toast';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import type { AnalyticsProps } from '@/analytics/types';
import { reportAppError, toUserFacingMessage, classifyAppError, logAppError, type ClassifiedAppError } from '@/utils/appError';

const DEFAULT_DURATION = 4200;

export function notifySuccess(title: string, description?: string): void {
  gooeyToast.success(title, {
    description,
    timing: { displayDuration: DEFAULT_DURATION },
    showTimestamp: false,
    preset: 'smooth',
  });
}

export function notifyInfo(title: string, description?: string): void {
  gooeyToast.info(title, {
    description,
    timing: { displayDuration: DEFAULT_DURATION },
    showTimestamp: false,
    preset: 'smooth',
  });
}

export function notifyWarning(title: string, description?: string): void {
  gooeyToast.warning(title, {
    description,
    timing: { displayDuration: 5000 },
    showTimestamp: false,
    preset: 'smooth',
  });
}

export function notifyError(
  titleOrError: string | unknown,
  descriptionOrContext?: string,
): ClassifiedAppError | null {
  if (typeof titleOrError === 'string') {
    trackEvent(AnalyticsEvents.softErrorShown, {
      title: titleOrError,
      description: descriptionOrContext,
    });
    gooeyToast.error(titleOrError, {
      description: descriptionOrContext,
      timing: { displayDuration: 5600 },
      showTimestamp: false,
      preset: 'smooth',
    });
    return null;
  }

  const classified = classifyAppError(titleOrError);
  const context = descriptionOrContext ?? 'Action failed';
  logAppError(context, titleOrError);
  trackEvent(AnalyticsEvents.softErrorShown, {
    title: classified.title,
    kind: classified.kind,
    context: descriptionOrContext,
  });
  const toast =
    classified.kind === 'validation' && !classified.isHard ? gooeyToast.warning : gooeyToast.error;
  toast(classified.title, {
    description: classified.userMessage,
    timing: { displayDuration: classified.kind === 'validation' ? 5000 : 5600 },
    showTimestamp: false,
    preset: 'smooth',
  });
  return classified;
}

/**
 * Soft action helper: shows loading → success/error gooey toasts.
 * Returns the resolved value; rethrows after toasting on failure.
 * Optionally emits a named PostHog product event on success/failure.
 */
export async function notifyPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((value: T) => string);
    error?: string | ((error: unknown) => string);
    successDescription?: string | ((value: T) => string);
    context?: string;
    /** Named product event emitted on success (and failure as action_failed). */
    event?: string;
    eventProps?: AnalyticsProps;
  },
): Promise<T> {
  const tracked = promise.then(
    (value) => {
      if (messages.event) {
        trackEvent(messages.event, messages.eventProps);
      } else {
        trackEvent(AnalyticsEvents.actionSucceeded, {
          context: messages.context ?? messages.loading,
          ...messages.eventProps,
        });
      }
      return value;
    },
    (error: unknown) => {
      trackEvent(AnalyticsEvents.actionFailed, {
        context: messages.context ?? messages.loading,
        event: messages.event,
        ...messages.eventProps,
      });
      throw error;
    },
  );

  gooeyToast.promise(tracked, {
    loading: messages.loading,
    success: messages.success,
    error: (error) => {
      reportAppError(messages.context ?? messages.loading, error);
      if (typeof messages.error === 'function') return messages.error(error);
      if (typeof messages.error === 'string') return messages.error;
      return toUserFacingMessage(error);
    },
    description: {
      success: messages.successDescription,
      error: (error) => toUserFacingMessage(error),
    },
    timing: { displayDuration: DEFAULT_DURATION },
    showTimestamp: false,
    preset: 'smooth',
  });

  return tracked;
}

const persistToastByContext = new Map<string, number>();
const PERSIST_TOAST_COOLDOWN_MS = 8_000;

/**
 * Soft toast for autosave failures without spamming during debounce retries.
 */
export function notifyPersistError(error: unknown, context: string): void {
  const now = Date.now();
  const last = persistToastByContext.get(context) ?? 0;
  if (now - last < PERSIST_TOAST_COOLDOWN_MS) {
    logAppError(context, error);
    return;
  }
  persistToastByContext.set(context, now);
  notifyError(error, context);
}
