import {
  getPlayableSteps,
  getStepMarkerPosition,
  getStepScreenshotUrl,
  getStepUrl,
} from '@peacock/shared';
import type { SavedFlowDocument, SavedFlowSummary } from '@/types/savedFlow';
import { BrowserMockup } from './BrowserMockup';
import { PlayerClickMarker } from './PlayerClickMarker';

interface CompareDocumentPaneProps {
  label: string;
  summaries: SavedFlowSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  document: SavedFlowDocument | null;
  isLoading: boolean;
  currentIndex: number;
}

export const CompareDocumentPane = ({
  label,
  summaries,
  selectedId,
  onSelect,
  document,
  isLoading,
  currentIndex,
}: CompareDocumentPaneProps) => {
  const playableSteps = document ? getPlayableSteps(document.steps) : [];
  const step = playableSteps[currentIndex] ?? null;
  const screenshotUrl = step ? getStepScreenshotUrl(step, document?.screenshotUrls ?? {}) : null;
  const markerPosition = step ? getStepMarkerPosition(step) : null;
  const stepUrl = step ? getStepUrl(step) : '';
  const description = step?.notes || step?.generatedDescription || '';

  return (
    <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peacock-600">{label}</p>
          <h2 className="mt-1 truncate text-base font-semibold text-slate-900">
            {document?.flow.flow.title || 'Select a document'}
          </h2>
        </div>
        <label className="min-w-[15rem]">
          <span className="sr-only">{label} document</span>
          <select
            value={selectedId}
            onChange={(event) => onSelect(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none ring-peacock-500 focus:border-peacock-300 focus:bg-white focus:ring-2"
          >
            {summaries.map((summary) => (
              <option key={summary.id} value={summary.id}>
                {summary.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Loading documentation…
          </div>
        ) : null}

        {!isLoading && !document ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-sm text-slate-500">
            Select a document to compare.
          </div>
        ) : null}

        {!isLoading && document && !step ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-sm text-slate-500">
            No corresponding step in this document for step {currentIndex + 1}.
          </div>
        ) : null}

        {!isLoading && document && step ? (
          <>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Step {currentIndex + 1} of {playableSteps.length}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm leading-6 text-slate-600">
                {description || 'No additional instructions were added for this step.'}
              </p>
            </div>

            <div className="min-w-0">
              <BrowserMockup url={stepUrl} isFluid>
                {screenshotUrl ? (
                  <div className="relative p-3 sm:p-4">
                    <img src={screenshotUrl} alt={step.title} className="block h-auto w-full object-contain" />
                    {markerPosition ? (
                      <PlayerClickMarker
                        step={step}
                        stepNumber={currentIndex + 1}
                        xPercent={markerPosition.xPercent}
                        yPercent={markerPosition.yPercent}
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className="flex min-h-[240px] items-center justify-center px-6 py-10 text-sm text-slate-500">
                    {step.event.type === 'navigation' ? 'Navigation step - no screenshot' : 'Screenshot unavailable'}
                  </div>
                )}
              </BrowserMockup>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};
