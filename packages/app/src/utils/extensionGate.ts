import { DASHBOARD_PATH, EXTENSION_INSTALL_PATH } from '@/constants/routes';

/**
 * Builds the install-gate URL that forwards to `nextPath` once the extension
 * is detected. Rejects protocol-relative / absolute URLs so `next` cannot be
 * used as an open redirect.
 */
export function getExtensionGatePath(nextPath: string = DASHBOARD_PATH): string {
  const safeNext = isSafeAppPath(nextPath) ? nextPath : DASHBOARD_PATH;
  const params = new URLSearchParams({ next: safeNext });
  return `${EXTENSION_INSTALL_PATH}?${params.toString()}`;
}

export function isSafeAppPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
}

export function readExtensionGateNext(search: string, fallback = DASHBOARD_PATH): string {
  const next = new URLSearchParams(search).get('next');
  if (!next || !isSafeAppPath(next)) return fallback;
  return next;
}
