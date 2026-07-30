import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { classifyAppError, isBenignBrowserNoise, logAppError } from '@/utils/appError';
import { isClerkSdkNoise, isExpectedClientNoise } from '@/observability/sentry';
import { isEmbedSharePath } from '@/constants/routes';
import { notifyError, notifyWarning } from '@/utils/notify';
import { buildHardErrorPath } from '@/pages/ErrorPage';

/**
 * Captures window-level failures that React boundaries miss
 * (async exceptions, unhandled promise rejections).
 * Soft by default via gooey toasts; hard cases navigate to ErrorPage.
 * React render crashes use AppErrorBoundary.
 */
export const GlobalErrorListeners = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const escalateOrToast = (classified: ReturnType<typeof classifyAppError>) => {
      if (classified.isHard) {
        if (isEmbedSharePath(pathname)) {
          notifyError(classified.title, classified.userMessage);
          return;
        }
        navigate(buildHardErrorPath(classified.title, classified.userMessage), { replace: true });
        return;
      }
      if (classified.kind === 'session' || classified.kind === 'auth') {
        notifyWarning(classified.title, classified.userMessage);
        return;
      }
      if (isExpectedClientNoise(classified.cause) || isExpectedClientNoise(classified.userMessage)) {
        notifyWarning(classified.title, classified.userMessage);
        return;
      }
      notifyError(classified.title, classified.userMessage);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (isBenignBrowserNoise(reason) || isClerkSdkNoise(reason) || isExpectedClientNoise(reason)) {
        event.preventDefault();
        return;
      }

      const classified = classifyAppError(reason);
      logAppError('Unhandled promise rejection', reason);
      escalateOrToast(classified);
    };

    const onWindowError = (event: ErrorEvent) => {
      if (!event.error && !event.message) return;
      // Cross-origin script errors often have no useful payload.
      if (event.message === 'Script error.' && !event.error) return;
      const payload = event.error ?? event.message;
      if (isBenignBrowserNoise(payload) || isClerkSdkNoise(payload) || isExpectedClientNoise(payload)) {
        event.preventDefault();
        return;
      }

      const error = event.error ?? new Error(event.message || 'Unknown window error');
      const classified = classifyAppError(error);
      logAppError('Window error', error);
      escalateOrToast(classified);
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onWindowError);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onWindowError);
    };
  }, [navigate, pathname]);

  return null;
};
