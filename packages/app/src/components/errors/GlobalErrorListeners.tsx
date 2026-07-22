import { useEffect } from 'react';
import { classifyAppError, logAppError } from '@/utils/appError';
import { notifyError, notifyWarning } from '@/utils/notify';

/**
 * Captures window-level failures that React boundaries miss
 * (async exceptions, unhandled promise rejections).
 * Soft by default via gooey toasts; React render crashes use AppErrorBoundary.
 */
export const GlobalErrorListeners = () => {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const classified = classifyAppError(reason);
      logAppError('Unhandled promise rejection', reason);

      if (classified.kind === 'session' || classified.kind === 'auth') {
        notifyWarning(classified.title, classified.userMessage);
        return;
      }

      notifyError(classified.title, classified.userMessage);
    };

    const onWindowError = (event: ErrorEvent) => {
      if (!event.error && !event.message) return;
      // Cross-origin script errors often have no useful payload.
      if (event.message === 'Script error.' && !event.error) return;

      const error = event.error ?? new Error(event.message || 'Unknown window error');
      const classified = classifyAppError(error);
      logAppError('Window error', error);
      notifyError(classified.title, classified.userMessage);
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onWindowError);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onWindowError);
    };
  }, []);

  return null;
};
