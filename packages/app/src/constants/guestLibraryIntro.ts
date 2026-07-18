export const GUEST_LIBRARY_INTRO_DISMISS_KEY = 'peacock-guest-library-intro-dismissed';

export function isGuestLibraryIntroDismissed(): boolean {
  try {
    return localStorage.getItem(GUEST_LIBRARY_INTRO_DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissGuestLibraryIntro(): void {
  try {
    localStorage.setItem(GUEST_LIBRARY_INTRO_DISMISS_KEY, 'true');
  } catch {
    // Ignore storage failures in private browsing.
  }
}
