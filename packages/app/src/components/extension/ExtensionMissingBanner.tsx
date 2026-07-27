import { AlertTriangle } from 'lucide-react';
import { CaptureDesktopRequired } from '@/components/extension/CaptureDesktopRequired';
import { ChromeWebStoreLink } from '@/components/extension/ChromeWebStoreLink';
import { useExtensionInstalled } from '@/hooks/useExtensionInstalled';
import { isCaptureUnsupportedClient } from '@/utils/isCaptureUnsupportedClient';

/**
 * Sticky dashboard warning when the Peacock Chrome extension is not detected.
 * On phones/tablets, shows a desktop-Chrome message instead of the Web Store CTA.
 * Hidden while probing and when the extension is installed (desktop).
 */
export const ExtensionMissingBanner = () => {
  const captureUnsupported = isCaptureUnsupportedClient();
  const { status } = useExtensionInstalled();

  if (captureUnsupported) {
    return <CaptureDesktopRequired variant="banner" surface="banner" />;
  }

  if (status !== 'missing') return null;

  return (
    <div
      role="alert"
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-8xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex rounded-lg bg-amber-100 p-1.5 text-amber-700 ring-1 ring-amber-200">
            <AlertTriangle className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Peacock Chrome extension not detected
            </p>
            <p className="mt-0.5 text-sm text-amber-800">
              Install the extension to capture workflows, screenshots, and product-tour demos from
              any website. Reload this page after installing.
            </p>
          </div>
        </div>
        <ChromeWebStoreLink className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800" />
      </div>
    </div>
  );
};
