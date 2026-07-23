/**
 * Best-effort mobile client detection for gating non-essential third parties
 * (e.g. Tawk). Prefer Client Hints, then coarse pointer / narrow viewport.
 */
export function isMobileClient(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  if (navigator.userAgentData?.mobile === true) return true;

  try {
    if (window.matchMedia('(pointer: coarse)').matches) return true;
    if (window.matchMedia('(max-width: 767px)').matches) return true;
  } catch {
    // matchMedia can throw in non-browser test stubs.
  }

  return false;
}
