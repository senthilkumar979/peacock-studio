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
    captureException: (error, props) => {
      if (isDev) console.info('[analytics] exception', error, props ?? {});
    },
    identify: (userId, traits) => {
      if (isDev) console.info('[analytics] identify', userId, traits ?? {});
    },
    group: (groupType, groupKey, properties) => {
      if (isDev) console.info('[analytics] group', groupType, groupKey, properties ?? {});
    },
    registerSuperProperties: (props) => {
      if (isDev) console.info('[analytics] registerSuperProperties', props);
    },
    reset: () => {
      if (isDev) console.info('[analytics] reset');
    },
  };
}
