const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      size?: 'normal' | 'flexible' | 'compact' | 'invisible';
      appearance?: 'always' | 'execute' | 'interaction-only';
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    },
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

export function getTurnstileSiteKey(): string | undefined {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || undefined;
}

export function isTurnstileConfigured(): boolean {
  return Boolean(getTurnstileSiteKey());
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile requires a browser environment.'));
  }
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${TURNSTILE_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile failed to load.')), {
        once: true,
      });
      if (window.turnstile) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `${TURNSTILE_SCRIPT_SRC}?render=explicit`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile failed to load.'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Obtains a Cloudflare Turnstile token (invisible widget).
 * When the site key is unset (local/dev), returns a placeholder so Edge Functions
 * can skip verification when TURNSTILE_SECRET_KEY is also unset.
 */
export async function getTurnstileToken(action: string): Promise<string> {
  const siteKey = getTurnstileSiteKey();
  if (!siteKey) {
    return `dev-bypass:${action}`;
  }

  await loadTurnstileScript();
  const api = window.turnstile;
  if (!api) {
    throw new Error('Turnstile is not available.');
  }

  return new Promise<string>((resolve, reject) => {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.style.width = '1px';
    host.style.height = '1px';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);

    let settled = false;
    const cleanup = (widgetId?: string) => {
      try {
        if (widgetId !== undefined) api.remove(widgetId);
      } catch {
        // Widget may already be gone ("Nothing to reset…") — ignore.
      }
      try {
        host.remove();
      } catch {
        // ignore
      }
    };

    let widgetId: string | undefined;
    try {
      widgetId = api.render(host, {
        sitekey: siteKey,
        size: 'invisible',
        appearance: 'execute',
        callback: (token) => {
          if (settled) return;
          settled = true;
          cleanup(widgetId);
          resolve(token);
        },
        'error-callback': () => {
          if (settled) return;
          settled = true;
          cleanup(widgetId);
          reject(new Error('Turnstile challenge failed.'));
        },
        'expired-callback': () => {
          if (settled) return;
          settled = true;
          cleanup(widgetId);
          reject(new Error('Turnstile challenge expired.'));
        },
      });
      api.execute(widgetId);
    } catch (error) {
      if (!settled) {
        settled = true;
        cleanup(widgetId);
        reject(error instanceof Error ? error : new Error('Turnstile execute failed.'));
      }
    }
  });
}
