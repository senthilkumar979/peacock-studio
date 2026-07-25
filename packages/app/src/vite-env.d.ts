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
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_TAWK_PROPERTY_ID?: string;
  readonly VITE_TAWK_WIDGET_ID?: string;
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

interface TawkApi {
  onLoad?: () => void;
  hideWidget?: () => void;
  showWidget?: () => void;
  maximize?: () => void;
  setAttributes?: (attributes: Record<string, string>, callback?: (error?: unknown) => void) => void;
  visitor?: Record<string, string>;
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
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

export {};
