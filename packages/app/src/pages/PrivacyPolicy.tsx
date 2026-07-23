import { TERMS_PATH } from '@/constants/routes';
import { LegalPage } from '@/pages/legal/LegalPage';
import { PRIVACY_SECTIONS } from '@/pages/legal/legalContent';

export const PrivacyPolicy = () => (
  <LegalPage
    variant="privacy"
    eyebrow="Legal"
    title="Privacy Policy"
    intro="How Peacock handles your information. Try as a guest with data in your browser; sign in to sync a cloud library, use team workspaces, and share securely."
    sections={PRIVACY_SECTIONS}
    relatedPage={{
      label: 'Terms & Conditions',
      href: TERMS_PATH,
      description: 'Acceptable use, your responsibilities, and the terms for using Peacock.',
    }}
  />
);
