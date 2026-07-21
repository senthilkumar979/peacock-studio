import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Puzzle, RefreshCw } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { ChromeWebStoreLink } from '@/components/extension/ChromeWebStoreLink';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { SiteNav } from '@/components/site/SiteNav';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { DASHBOARD_PATH } from '@/constants/routes';
import { useExtensionInstalled } from '@/hooks/useExtensionInstalled';
import { readExtensionGateNext } from '@/utils/extensionGate';

const BENEFITS = [
  'Record clicks, inputs, and screenshots on any website',
  'Capture visible, selected, or full-page screenshots',
  'Stop recording to open a polished Flow Document in the editor',
  'Free during beta — install from the Chrome Web Store',
] as const;

export const ExtensionInstallPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const nextPath = readExtensionGateNext(location.search, DASHBOARD_PATH);
  const { status, isInstalled, isChecking, recheck } = useExtensionInstalled();

  useEffect(() => {
    if (isInstalled) {
      navigate(nextPath, { replace: true });
    }
  }, [isInstalled, navigate, nextPath]);

  if (isChecking || status === 'installed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={140} />
        <p className="text-sm text-slate-500">
          {status === 'installed' ? 'Extension found — opening Peacock…' : 'Checking for the Peacock extension…'}
        </p>
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen">
      <SiteNav />

      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 pb-20 pt-28 text-white sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-cyan/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-cyan"
          >
            <Puzzle className="h-3.5 w-3.5" aria-hidden />
            Required for capture
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 flex justify-center"
          >
            <span className="inline-flex rounded-2xl bg-gradient-to-br from-peacock-500 to-brand-violet p-4 shadow-lg shadow-peacock-900/40">
              <img src={PEACOCK_LOGO_SRC} alt="" className="h-14 w-14 object-contain" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Install the {PEACOCK_APP_NAME} Chrome extension
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300"
          >
            Peacock needs the browser extension to record workflows and screenshots. Install it from
            the Chrome Web Store, then come back here — we&apos;ll open the app automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <ChromeWebStoreLink className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-peacock-800 shadow-lg transition hover:bg-slate-100" />
            <button
              type="button"
              onClick={recheck}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              I already installed it — check again
            </button>
          </motion.div>
        </div>
      </section>

      <section className="landing-section-light">
        <div className="landing-section-inner grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">What you get</h2>
            <ul className="mt-5 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-lg bg-peacock-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-peacock-800">
              <Puzzle className="h-3.5 w-3.5" aria-hidden />
              Chrome Web Store
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">After you install</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              <li>Pin Peacock Studio to your Chrome toolbar.</li>
              <li>
                Reload this tab (or click &ldquo;check again&rdquo;) so Peacock can detect the
                extension on <span className="font-medium text-slate-800">localhost:5173</span>.
              </li>
              <li>
                We&apos;ll take you to{' '}
                <span className="font-medium text-slate-800">{nextPath}</span> to continue.
              </li>
            </ol>
            <ChromeWebStoreLink className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-peacock-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-peacock-800">
              Open Chrome Web Store
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ChromeWebStoreLink>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
};
