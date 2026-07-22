import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { DASHBOARD_PATH, ERROR_PATH } from '@/constants/routes';

/**
 * Dedicated hard-error route. Soft failures should use gooey toasts instead.
 * Query: ?title=&message= (optional, URL-encoded).
 */
export const ErrorPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const title = params.get('title')?.trim() || 'Something went wrong';
  const message =
    params.get('message')?.trim() ||
    'An unexpected error occurred. Return to your dashboard and try again.';

  useEffect(() => {
    document.title = `${title} · Peacock Studio`;
  }, [title]);

  return (
    <HardErrorPage
      title={title}
      description={message}
      homePath={DASHBOARD_PATH}
      homeLabel="Go to dashboard"
      onRetry={() => navigate(DASHBOARD_PATH, { replace: true })}
    />
  );
};

/** Navigate to the hard error page with a safe user message. */
export function buildHardErrorPath(title: string, message: string): string {
  const params = new URLSearchParams({
    title: title.slice(0, 80),
    message: message.slice(0, 280),
  });
  return `${ERROR_PATH}?${params.toString()}`;
}
