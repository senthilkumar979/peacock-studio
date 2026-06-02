import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import type { SavedFlowDocument } from '@/types/savedFlow';
import { getFlowDocument } from '@/services/flowLibraryService';
import type { TourDemoRef } from '@/types/productTour';

interface TourDemoIntroPanelProps {
  featureNumber: number;
  demo: TourDemoRef;
  demoNumber: number;
  stepCount: number;
  onContinue: () => void;
}

export const TourDemoIntroPanel = ({
  featureNumber,
  demo,
  demoNumber,
  stepCount,
  onContinue,
}: TourDemoIntroPanelProps) => {
  const [doc, setDoc] = useState<SavedFlowDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void getFlowDocument(demo.documentId)
      .then((next) => {
        if (cancelled) return;
        setDoc(next ?? null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [demo.documentId]);

  const title = useMemo(() => doc?.flow.flow.title ?? demo.label ?? `Demo ${demoNumber}`, [doc, demo.label, demoNumber]);
  const description = doc?.flow.flow.description ?? '';

  return (
    <article className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50 via-white to-brand-violet/5"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-peacock-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-peacock-800">
            Demo {demoNumber}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Feature {featureNumber}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {stepCount} steps
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>

        {description ? (
          <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
        ) : null}

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading demo details…</p>
        ) : null}

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-peacock-50 text-peacock-700 ring-1 ring-peacock-200/70">
              <Play className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Next</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                We will play this demo from the start and step through it in order.
              </p>
            </div>
          </div>
        </div>

        <button type="button" onClick={onContinue} className="btn-peacock mt-8 w-full sm:w-auto">
          Start demo
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
  );
};

