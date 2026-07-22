import { gooeyToast } from 'goey-toast';
import { reportAppError, toUserFacingMessage, type ClassifiedAppError } from '@/utils/appError';

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
    gooeyToast.error(titleOrError, {
      description: descriptionOrContext,
      timing: { displayDuration: 5600 },
      showTimestamp: false,
      preset: 'smooth',
    });
    return null;
  }

  const classified = reportAppError(descriptionOrContext ?? 'Action failed', titleOrError);
  gooeyToast.error(classified.title, {
    description: classified.userMessage,
    timing: { displayDuration: 5600 },
    showTimestamp: false,
    preset: 'smooth',
  });
  return classified;
}

/**
 * Soft action helper: shows loading → success/error gooey toasts.
 * Returns the resolved value; rethrows after toasting on failure.
 */
export async function notifyPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((value: T) => string);
    error?: string | ((error: unknown) => string);
    successDescription?: string | ((value: T) => string);
    context?: string;
  },
): Promise<T> {
  gooeyToast.promise(promise, {
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

  return promise;
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
    reportAppError(context, error);
    return;
  }
  persistToastByContext.set(context, now);
  notifyError(error, context);
}
