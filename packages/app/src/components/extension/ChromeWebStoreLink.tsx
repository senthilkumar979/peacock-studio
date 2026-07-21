import { ExternalLink, Puzzle } from 'lucide-react';
import {
  CHROME_WEB_STORE_EXTENSION_URL,
  EXTENSION_DISPLAY_NAME,
} from '@/constants/extension';

interface ChromeWebStoreLinkProps {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

/** Always opens the Chrome Web Store listing in a new tab. */
export const ChromeWebStoreLink = ({
  className,
  children,
  showIcon = false,
}: ChromeWebStoreLinkProps) => (
  <a
    href={CHROME_WEB_STORE_EXTENSION_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
  >
    {showIcon ? <Puzzle className="h-4 w-4 shrink-0" aria-hidden /> : null}
    {children ?? EXTENSION_DISPLAY_NAME}
    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
  </a>
);
