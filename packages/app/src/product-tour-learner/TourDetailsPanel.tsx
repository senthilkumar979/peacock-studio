import { Clock, Layers, Map, Sparkles } from 'lucide-react';
import type { ProductTour } from '@/types/productTour';
import { stripHtmlTags } from '@/utils/richText';

interface TourDetailsPanelProps {
  tour: ProductTour;
  estimatedMinutes: number | null;
  featureCount: number;
  demoCount: number;
  onContinue: () => void;
}

export const TourDetailsPanel = ({
  tour,
  estimatedMinutes,
  featureCount,
  demoCount,
  onContinue,
}: TourDetailsPanelProps) => (
  <article className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-violet/5 via-white to-peacock-50"
      aria-hidden
    />
    <div className="relative z-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-violet">
            Product tour
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {tour.title}
          </h2>
          {tour.description ? (
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {stripHtmlTags(tour.description)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {estimatedMinutes ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-peacock-50 px-3 py-1 text-sm font-semibold text-peacock-800">
              <Clock className="h-4 w-4" aria-hidden />
              ~{estimatedMinutes} min
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
            <Layers className="h-4 w-4" aria-hidden />
            {featureCount} features
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
            <Map className="h-4 w-4" aria-hidden />
            {demoCount} demos
          </span>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peacock-50 text-peacock-700 ring-1 ring-peacock-200">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">What you will do</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              You will learn the product from the perspective of the selected persona, going feature-by-feature
              through real demos.
            </p>
          </div>
        </div>
      </div>

      <button type="button" onClick={onContinue} className="btn-peacock mt-8 w-full sm:w-auto">
        Start feature walkthrough
      </button>
    </div>
  </article>
);

