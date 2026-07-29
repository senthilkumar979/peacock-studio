/// <reference types="vite/client" />

declare module '*.woff?url' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_EXTENSION_ID?: string;
  readonly VITE_CLOUD_SYNC?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_GUEST_VISIBLE_DOC_LIMIT?: string;
  readonly VITE_FREE_ACCOUNT_DOC_LIMIT?: string;
  readonly VITE_FREE_ACCOUNT_STORAGE_BYTES_LIMIT?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_RELEASE?: string;
  readonly VITE_FRESHCHAT_SCRIPT_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ChromeRuntime {
  sendMessage: <T>(
    extensionId: string,
    message: unknown,
    responseCallback: (response: T) => void
  ) => void;
  lastError?: { message?: string };
}

interface ChromeApi {
  runtime?: ChromeRuntime;
}

interface FreshchatWidget {
  init?: (config: { token: string; host: string }) => void;
  open: (payload?: { name?: string; replyText?: string }) => void;
  close: () => void;
  show: () => void;
  hide: () => void;
  destroy: () => void;
  isLoaded: () => boolean;
  isOpen: () => boolean;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface NavigatorUAData {
  readonly mobile: boolean;
}

declare global {
  interface Navigator {
    readonly userAgentData?: NavigatorUAData;
  }

  interface Window {
    chrome?: ChromeApi;
    fcWidget?: FreshchatWidget;
  }
}

export {};
