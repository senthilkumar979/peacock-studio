import { ExternalLink, Puzzle } from 'lucide-react';
import { EXTENSION_DISPLAY_NAME } from '@/constants/extension';
import { getPreferredExtensionStoreListing } from '@/utils/getPreferredExtensionStore';

interface ExtensionStoreLinkProps {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  onClick?: () => void;
}

/**
 * Opens the preferred extension store listing for the current browser
 * (Chrome Web Store, Edge Add-ons, Firefox AMO when configured).
 */
export const ExtensionStoreLink = ({
  className,
  children,
  showIcon = false,
  onClick,
}: ExtensionStoreLinkProps) => {
  const listing = getPreferredExtensionStoreListing();
  const href = listing.storeUrl;
  if (!href) return null;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {showIcon ? <Puzzle className="h-4 w-4 shrink-0" aria-hidden /> : null}
      {children ?? EXTENSION_DISPLAY_NAME}
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
};
