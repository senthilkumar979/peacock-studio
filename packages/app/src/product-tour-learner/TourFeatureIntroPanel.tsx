import type { TourFeature } from '@/types/productTour';

interface TourFeatureIntroPanelProps {
  feature: TourFeature;
  featureNumber: number;
  onContinue: () => void;
}

export const TourFeatureIntroPanel = ({
  feature,
  featureNumber,
  onContinue,
}: TourFeatureIntroPanelProps) => (
  <article className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-violet/5 via-white to-peacock-50"
      aria-hidden
    />
    <div className="relative z-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-violet">
          Feature {featureNumber}
        </span>
        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {feature.demos.length} {feature.demos.length === 1 ? 'demo' : 'demos'}
        </span>
      </div>

      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {feature.title}
      </h2>

      {feature.description ? (
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          {feature.description}
        </p>
      ) : (
        <p className="mt-4 text-sm italic text-slate-400">No feature description yet.</p>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="btn-peacock mt-8 w-full sm:w-auto"
      >
        Continue to demos
      </button>
    </div>
  </article>
);
