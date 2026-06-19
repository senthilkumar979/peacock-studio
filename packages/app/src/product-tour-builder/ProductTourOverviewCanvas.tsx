import { CheckCircle2, GitBranch, Layers3, PlayCircle, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getSortedFeatures } from '@/store/productTourBuilderStore';
import type { ProductTour } from '@/types/productTour';
import { buildTourDemoMeta, getTourDemoDisplayTitle, type DemoPlaybackMeta } from '@/utils/productTourLearner';

interface ProductTourOverviewCanvasProps {
  tour: ProductTour;
  activeFeatureIndex?: number | null;
  activeDemoIndex?: number | null;
  demoMeta?: DemoPlaybackMeta[][];
  activeStageLabel?: string;
  activeBranchTitle?: string | null;
  activePathLabel?: string | null;
}

const EMPTY_DEMO_META: DemoPlaybackMeta[][] = [];

function buildTourDemoStructureKey(tour: ProductTour): string {
  return getSortedFeatures(tour)
    .map((feature) =>
      `${feature.id}:${feature.demos.map((demo) => demo.documentId).join(',')}`,
    )
    .join('|');
}

export const ProductTourOverviewCanvas = ({
  tour,
  activeFeatureIndex = null,
  activeDemoIndex = null,
  demoMeta,
  activeStageLabel = 'Builder mode',
  activeBranchTitle = null,
  activePathLabel = null,
}: ProductTourOverviewCanvasProps) => {
  const features = getSortedFeatures(tour);
  const totalDemos = features.reduce((sum, feature) => sum + feature.demos.length, 0);
  const resolvedDemoMetaProp = demoMeta ?? EMPTY_DEMO_META;
  const hasProvidedDemoMeta = resolvedDemoMetaProp.length > 0;
  const tourDemoStructureKey = useMemo(() => buildTourDemoStructureKey(tour), [tour]);
  const [resolvedDemoMeta, setResolvedDemoMeta] = useState<DemoPlaybackMeta[][]>(
    resolvedDemoMetaProp,
  );

  useEffect(() => {
    if (hasProvidedDemoMeta) {
      setResolvedDemoMeta(resolvedDemoMetaProp);
      return;
    }

    let cancelled = false;
    void buildTourDemoMeta(tour).then((nextMeta) => {
      if (!cancelled) setResolvedDemoMeta(nextMeta);
    });
    return () => {
      cancelled = true;
    };
  }, [hasProvidedDemoMeta, resolvedDemoMetaProp, tour, tourDemoStructureKey]);

  const activeFeature = activeFeatureIndex !== null ? features[activeFeatureIndex] : null;
  const activeDemo =
    activeFeature && activeDemoIndex !== null ? activeFeature.demos[activeDemoIndex] : null;
  const activeDemoTitle =
    activeDemo && activeDemoIndex !== null
      ? getTourDemoDisplayTitle(
          activeDemo,
          activeFeatureIndex !== null
            ? resolvedDemoMeta[activeFeatureIndex]?.[activeDemoIndex]
            : undefined,
          activeDemoIndex,
        )
      : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-peacock-50/60 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Tour overview
        </p>
        <h3 className="mt-1 text-base font-bold text-slate-900">{tour.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <Layers3 className="h-3.5 w-3.5" aria-hidden />
            {features.length} features
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <PlayCircle className="h-3.5 w-3.5" aria-hidden />
            {totalDemos} demos
          </span>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Current location
        </p>
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p
            title={activeStageLabel}
            className="truncate text-sm font-semibold text-slate-900"
          >
            {activeStageLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeFeature ? (
              <span
                title={activeFeature.title}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-peacock-50 px-2.5 py-1 text-xs font-medium text-peacock-800"
              >
                <Layers3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="max-w-[170px] truncate">{activeFeature.title}</span>
              </span>
            ) : null}
            {activeDemo ? (
              <span
                title={activeDemoTitle ?? undefined}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                <PlayCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="max-w-[170px] truncate">{activeDemoTitle}</span>
              </span>
            ) : null}
            {activeBranchTitle ? (
              <span
                title={activeBranchTitle}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-violet/10 px-2.5 py-1 text-xs font-medium text-brand-violet"
              >
                <GitBranch className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="max-w-[170px] truncate">{activeBranchTitle}</span>
              </span>
            ) : null}
            {activePathLabel ? (
              <span
                title={activePathLabel}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-violet/5 px-2.5 py-1 text-xs font-medium text-brand-violet"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="max-w-[170px] truncate">{activePathLabel}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-h-[62vh] overflow-y-auto px-5 py-5">
        <ol className="space-y-4">
          {features.map((feature, index) => {
            const isActiveFeature = activeFeatureIndex === index;
            return (
              <li key={feature.id} className="relative pl-9">
                <span className="absolute left-[0.84rem] top-0 h-full w-px bg-slate-200" aria-hidden />
                <span
                  className={`absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                    isActiveFeature
                      ? 'bg-peacock-600 text-white shadow-md shadow-peacock-500/35'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  aria-hidden
                >
                  {index + 1}
                </span>

                <article
                  className={`rounded-2xl border p-4 transition ${
                    isActiveFeature
                      ? 'border-peacock-400 bg-gradient-to-br from-peacock-50 to-white shadow-md shadow-peacock-100'
                      : 'border-slate-200 bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Feature {index + 1}
                      </p>
                      <p
                        title={feature.title}
                        className="mt-1 truncate text-sm font-semibold text-slate-900"
                      >
                        {feature.title}
                      </p>
                    </div>
                    {isActiveFeature ? (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-peacock-100 px-2 py-0.5 text-[11px] font-semibold text-peacock-800">
                        Active
                      </span>
                    ) : null}
                  </div>

                  {feature.demos.length ? (
                    <ul className="mt-3 space-y-1.5">
                      {feature.demos.map((demo, demoIndex) => {
                        const isActiveDemo = isActiveFeature && activeDemoIndex === demoIndex;
                        const demoMeta = resolvedDemoMeta[index]?.[demoIndex];
                        const branchCount = demoMeta?.branchCount ?? 0;
                        const demoTitle = getTourDemoDisplayTitle(demo, demoMeta, demoIndex);
                        return (
                          <li
                            key={demo.id}
                            className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs ${
                              isActiveDemo
                                ? 'border-peacock-300 bg-peacock-100/70 text-peacock-900'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <span title={demoTitle} className="truncate">
                              {demoTitle}
                            </span>
                            <span className="ml-2 inline-flex shrink-0 items-center gap-1">
                              {branchCount > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-violet/10 px-2 py-0.5 text-[10px] font-semibold text-brand-violet">
                                  <GitBranch className="h-3 w-3" aria-hidden />
                                  {branchCount}
                                </span>
                              ) : null}
                              {isActiveDemo ? (
                                <Sparkles className="h-3.5 w-3.5 text-peacock-700" aria-hidden />
                              ) : null}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs italic text-slate-400">No demos yet</p>
                  )}
                </article>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex items-center justify-center rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-amber-100 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-rose-700" aria-hidden />
          <p className="ml-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
            Tour complete
          </p>
        </div>
      </div>
    </section>
  );
};
