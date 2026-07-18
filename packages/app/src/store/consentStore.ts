import { create } from 'zustand';
import {
  createConsentRecord,
  parseConsentRecord,
  type ConsentRecord,
} from '@peacock/shared';
import { CONSENT_STORAGE_KEY } from '@/constants/consent';

function readStoredConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseConsentRecord(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function persistConsent(record: ConsentRecord): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage failures (private mode/quota); consent simply re-prompts next visit.
  }
}

interface ConsentState {
  record: ConsentRecord | null;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (analytics: boolean) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  resetConsent: () => void;
}

export const useConsentStore = create<ConsentState>((set) => {
  const decide = (analytics: boolean) => {
    const record = createConsentRecord(analytics);
    persistConsent(record);
    set({ record, isPreferencesOpen: false });
  };

  return {
    record: readStoredConsent(),
    isPreferencesOpen: false,
    acceptAll: () => decide(true),
    rejectNonEssential: () => decide(false),
    savePreferences: (analytics) => decide(analytics),
    openPreferences: () => set({ isPreferencesOpen: true }),
    closePreferences: () => set({ isPreferencesOpen: false }),
    resetConsent: () => {
      try {
        window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      } catch {
        // Ignore storage failures.
      }
      set({ record: null, isPreferencesOpen: false });
    },
  };
});
