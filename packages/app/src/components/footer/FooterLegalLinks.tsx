import { Link } from 'react-router-dom';
import { PRIVACY_PATH, TERMS_PATH } from '@/constants/routes';
import { useConsentStore } from '@/store/consentStore';

interface FooterLegalLinksProps {
  className?: string;
  linkClassName?: string;
  withSeparators?: boolean;
}

const DEFAULT_LINK_CLASS =
  'text-xs font-medium text-slate-500 underline-offset-2 transition hover:text-peacock-700 hover:underline';

const SEPARATOR_CLASS = 'select-none text-slate-300';

export const FooterLegalLinks = ({
  className = 'flex flex-wrap items-center gap-x-4 gap-y-1',
  linkClassName = DEFAULT_LINK_CLASS,
  withSeparators = false,
}: FooterLegalLinksProps) => {
  const openPreferences = useConsentStore((state) => state.openPreferences);

  if (withSeparators) {
    return (
      <div className={className}>
        <Link to={PRIVACY_PATH} className={linkClassName}>
          Privacy
        </Link>
        <span className={SEPARATOR_CLASS} aria-hidden>
          ·
        </span>
        <Link to={TERMS_PATH} className={linkClassName}>
          Terms
        </Link>
        <span className={SEPARATOR_CLASS} aria-hidden>
          ·
        </span>
        <button type="button" onClick={openPreferences} className={linkClassName}>
          Cookie preferences
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Link to={PRIVACY_PATH} className={linkClassName}>
        Privacy
      </Link>
      <Link to={TERMS_PATH} className={linkClassName}>
        Terms
      </Link>
      <button type="button" onClick={openPreferences} className={linkClassName}>
        Cookie preferences
      </button>
    </div>
  );
};
