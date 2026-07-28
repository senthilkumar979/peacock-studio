import { ExtensionStoreLink } from '@/components/extension/ExtensionStoreLink';

interface ChromeWebStoreLinkProps {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  onClick?: () => void;
}

/**
 * @deprecated Prefer `ExtensionStoreLink`. Kept as a thin wrapper so existing
 * imports keep working; opens the browser-preferred store listing.
 */
export const ChromeWebStoreLink = (props: ChromeWebStoreLinkProps) => (
  <ExtensionStoreLink {...props} />
);
