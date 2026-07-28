import {
  EXTENSION_MESSAGING_FAMILY_ORDER,
  EXTENSION_STORE_BY_FAMILY,
  PUBLISHED_EXTENSION_ID,
} from '@/constants/extension';

/**
 * All extension IDs the SPA may message: `VITE_EXTENSION_ID` (unpacked) first,
 * then published store IDs that are configured (Chrome, Edge, Firefox, …).
 */
export function getConfiguredExtensionIds(): string[] {
  const ids: string[] = [];
  const fromEnv = import.meta.env.VITE_EXTENSION_ID?.trim();
  if (fromEnv) ids.push(fromEnv);

  for (const family of EXTENSION_MESSAGING_FAMILY_ORDER) {
    const id = EXTENSION_STORE_BY_FAMILY[family]?.extensionId?.trim();
    if (id && !ids.includes(id)) ids.push(id);
  }

  return ids;
}

/**
 * Primary extension ID for messaging. Prefers `VITE_EXTENSION_ID` for local
 * unpacked builds, otherwise the first configured published store ID.
 */
export function getExtensionId(): string {
  return getConfiguredExtensionIds()[0] ?? PUBLISHED_EXTENSION_ID;
}
