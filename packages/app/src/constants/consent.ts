import type { ConsentCategoryMeta } from '@peacock/shared';

export const CONSENT_STORAGE_KEY = 'peacock-cookie-consent';

export const CONSENT_CATEGORIES: ConsentCategoryMeta[] = [
  {
    id: 'necessary',
    label: 'Strictly necessary',
    description:
      'Required for Peacock to work — your local library (IndexedDB), session state, and sign-in. Always on.',
    required: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'Helps us understand how Peacock is used so we can improve it. Off unless you allow it.',
    required: false,
  },
];
