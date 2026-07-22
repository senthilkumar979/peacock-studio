const INTENTIONAL_SIGN_OUT_KEY = 'peacock.intentionalSignOut';

/** Call before Clerk signOut so we do not toast "session ended". */
export function markIntentionalSignOut(): void {
  try {
    sessionStorage.setItem(INTENTIONAL_SIGN_OUT_KEY, '1');
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/** Returns true once if the user deliberately signed out. */
export function consumeIntentionalSignOut(): boolean {
  try {
    const value = sessionStorage.getItem(INTENTIONAL_SIGN_OUT_KEY);
    if (value === '1') {
      sessionStorage.removeItem(INTENTIONAL_SIGN_OUT_KEY);
      return true;
    }
  } catch {
    // Ignore.
  }
  return false;
}
