import { PRIVACY_PATH } from '@/constants/routes';
import { LegalPage } from '@/pages/legal/LegalPage';
import { TERMS_SECTIONS } from '@/pages/legal/legalContent';

export const TermsAndConditions = () => (
  <LegalPage
    variant="terms"
    eyebrow="Legal"
    title="Terms & Conditions"
    intro="The terms that govern your use of Peacock. Please read them carefully before recording, sharing, or publishing documentation."
    sections={TERMS_SECTIONS}
    relatedPage={{
      label: 'Privacy Policy',
      href: PRIVACY_PATH,
      description: 'How Peacock handles information, cookies, analytics, and local storage.',
    }}
  />
);
