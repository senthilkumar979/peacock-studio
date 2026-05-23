/// <reference types="vite/client" />

declare module '*.woff?url' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_EXTENSION_ID: string;
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
