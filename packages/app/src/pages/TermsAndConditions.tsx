import { LegalPage } from '@/pages/legal/LegalPage';
import { TERMS_SECTIONS } from '@/pages/legal/legalContent';

export const TermsAndConditions = () => (
  <LegalPage
    title="Terms & Conditions"
    intro="The terms that govern your use of Peacock. Please read them carefully before using the product."
    sections={TERMS_SECTIONS}
  />
);
