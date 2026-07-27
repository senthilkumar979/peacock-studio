const STORAGE_KEY = 'peacock-founding-user-interest';

export interface FoundingUserInterest {
  interestedAt: string;
  /** Optional contact email captured on the pricing waitlist (device-local only). */
  email?: string;
}

function readInterest(): FoundingUserInterest | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FoundingUserInterest;
    if (!parsed?.interestedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasFoundingUserInterest(): boolean {
  return Boolean(readInterest());
}

export function getFoundingUserInterest(): FoundingUserInterest | null {
  return readInterest();
}

export function markFoundingUserInterest(email?: string): void {
  const trimmed = email?.trim();
  const record: FoundingUserInterest = {
    interestedAt: new Date().toISOString(),
    ...(trimmed ? { email: trimmed } : {}),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore quota / private-mode failures.
  }
}
