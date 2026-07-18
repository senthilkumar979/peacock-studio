import type { AnalyticsSink } from './types';

const isDev = import.meta.env.DEV;

/**
 * Default sink used until a real provider is wired in. Logs to the console in
 * development and is a no-op in production, so nothing leaves the browser.
 * Callers must never pass passwords, tokens, or sensitive field values as props.
 */
export function createConsoleSink(): AnalyticsSink {
  return {
    init: () => {
      if (isDev) console.info('[analytics] init');
    },
    shutdown: () => {
      if (isDev) console.info('[analytics] shutdown');
    },
    track: (name, props) => {
      if (isDev) console.info('[analytics] track', name, props ?? {});
    },
    page: (path) => {
      if (isDev) console.info('[analytics] page', path);
    },
  };
}
