import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Laptop, MonitorSmartphone } from 'lucide-react';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';

type CaptureDesktopRequiredVariant = 'page' | 'card' | 'banner';

interface CaptureDesktopRequiredProps {
  variant?: CaptureDesktopRequiredVariant;
  /** Analytics surface label, e.g. install_page | editor | banner */
  surface: string;
}

const TITLE = 'Capture needs a desktop browser';
const BODY =
  'Peacock records workflows with a browser extension (Chrome or Edge), which phones and tablets cannot run. Open this site on a computer, install the extension, then capture. On this device you can still browse your library and open shared guides.';

/**
 * Informational (non-throwing) UI when Flow Doc capture is attempted on a
 * client that cannot install Chromium MV3 extensions (Chrome / Edge).
 */
export const CaptureDesktopRequired = ({
  variant = 'card',
  surface,
}: CaptureDesktopRequiredProps) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent(AnalyticsEvents.captureBlockedMobile, { surface });
  }, [surface]);

  if (variant === 'banner') {
    return (
      <div role="status" className="border-b border-sky-200 bg-sky-50 px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex rounded-lg bg-sky-100 p-1.5 text-sky-700 ring-1 ring-sky-200">
              <MonitorSmartphone className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-sky-950">{TITLE}</p>
              <p className="mt-0.5 text-sm text-sky-800">
                Open Peacock on a computer with Chrome or Edge to record workflows. You can still
                browse guides here.
              </p>
            </div>
          </div>
          <Link
            to={DASHBOARD_PATH}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
          >
            Open library
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className="landing-page min-h-screen">
        <SiteNav />
        <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 pb-20 pt-28 text-white sm:pt-32">
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-cyan">
              <Laptop className="h-3.5 w-3.5" aria-hidden />
              Desktop required
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">{BODY}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={DASHBOARD_PATH}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-peacock-800 shadow-lg transition hover:bg-slate-100"
              >
                Open library
              </Link>
              <Link
                to={LANDING_PATH}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Continue browsing
              </Link>
            </div>
          </div>
        </section>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <span className="mx-auto inline-flex rounded-xl bg-sky-50 p-3 text-sky-700 ring-1 ring-sky-100">
          <Laptop className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">{TITLE}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{BODY}</p>
        <div className="mt-5 flex flex-col items-center gap-3">
          <Link
            to={DASHBOARD_PATH}
            className="inline-flex items-center gap-2 rounded-xl bg-peacock-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-800"
          >
            Open library
          </Link>
          <Link
            to={LANDING_PATH}
            className="text-sm font-medium text-peacock-700 hover:text-peacock-800"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
};
