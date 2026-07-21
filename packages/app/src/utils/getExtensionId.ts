import { PUBLISHED_EXTENSION_ID } from '@/constants/extension';

/**
 * Returns the Chrome extension ID to message. Prefers `VITE_EXTENSION_ID` for
 * local unpacked builds, otherwise falls back to the published Web Store ID.
 */
export function getExtensionId(): string {
  const fromEnv = import.meta.env.VITE_EXTENSION_ID?.trim();
  return fromEnv || PUBLISHED_EXTENSION_ID;
}
