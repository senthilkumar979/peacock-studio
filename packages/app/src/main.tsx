import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/components/auth/AppProviders';
import { App } from './App';
import './index.css';

function scheduleIdle(task: () => void, timeoutMs = 3500): void {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => task(), { timeout: timeoutMs });
    return;
  }
  window.setTimeout(task, Math.min(timeoutMs, 2000));
}

/** Sentry is non-critical for first paint — load after idle. */
scheduleIdle(() => {
  void import('@/observability/sentry').then((m) => m.initSentry());
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
