import {
  CONSENT_POLICY_VERSION,
  isAnalyticsAllowed,
  needsConsentDecision,
} from '@peacock/shared';
import { useConsentStore } from '@/store/consentStore';

export const useConsent = () => {
  const record = useConsentStore((state) => state.record);
  const isPreferencesOpen = useConsentStore((state) => state.isPreferencesOpen);

  const needsDecision = needsConsentDecision(record, CONSENT_POLICY_VERSION);

  return {
    record,
    hasDecided: !needsDecision,
    isBannerVisible: needsDecision && !isPreferencesOpen,
    isPreferencesOpen,
    isAnalyticsAllowed: isAnalyticsAllowed(record),
  };
};
