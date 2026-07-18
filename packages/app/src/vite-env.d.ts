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

declare global {
  interface Window {
    chrome?: ChromeApi;
  }
}

export {};
