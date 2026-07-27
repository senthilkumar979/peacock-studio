/**
 * Detects clients that cannot run Chrome MV3 extensions for Flow Doc capture.
 * Prefer Client Hints; fall back to classic mobile UA. Intentionally ignores
 * viewport width so narrow desktop windows are not blocked.
 */
const MOBILE_UA_RE = /Android|iPhone|iPad|iPod|Mobile/i;

export function isCaptureUnsupportedClient(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  if (navigator.userAgentData?.mobile === true) return true;

  return MOBILE_UA_RE.test(navigator.userAgent);
}
