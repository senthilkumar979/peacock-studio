import { LegalPage } from '@/pages/legal/LegalPage';
import { PRIVACY_SECTIONS } from '@/pages/legal/legalContent';

export const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    intro="How Peacock handles your information. Peacock is local-first: your documentation stays in your browser by default."
    sections={PRIVACY_SECTIONS}
  />
);
