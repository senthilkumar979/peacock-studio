import { useState } from 'react';
import { AlignLeft, Layers3, Plus, Trash2 } from 'lucide-react';
import { AddPeacockModal } from '@/route-builder/AddPeacockModal';
import { RoutePeacockList } from '@/route-builder/RoutePeacockList';
import { useProductTourBuilderStore } from '@/store/productTourBuilderStore';
import type { TourFeature } from '@/types/productTour';
import type { SavedFlowSummary } from '@/types/savedFlow';

interface TourFeatureCardProps {
  feature: TourFeature;
  featureNumber: number;
  summaries: SavedFlowSummary[];
  summariesById: Map<string, SavedFlowSummary>;
  canDelete: boolean;
}

export const TourFeatureCard = ({
  feature,
  featureNumber,
  summaries,
  summariesById,
  canDelete,
}: TourFeatureCardProps) => {
  const updateFeature = useProductTourBuilderStore((state) => state.updateFeature);
  const deleteFeature = useProductTourBuilderStore((state) => state.deleteFeature);
  const addDemo = useProductTourBuilderStore((state) => state.addDemo);
  const removeDemo = useProductTourBuilderStore((state) => state.removeDemo);
  const reorderDemos = useProductTourBuilderStore((state) => state.reorderDemos);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/60">
      <div className="border-b border-slate-100 bg-gradient-to-br from-white via-slate-50 to-peacock-50/40 px-4 py-4 sm:px-5">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-peacock-500 to-brand-violet text-sm font-bold text-white shadow-sm">
            {featureNumber}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Feature {featureNumber}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Define what users should learn in this part.
            </p>
          </div>
          {canDelete ? (
            <button
              type="button"
              onClick={() => deleteFeature(feature.id)}
              className="h-fit rounded-lg border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50"
              aria-label={`Delete feature ${featureNumber}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <label className="block text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <Layers3 className="h-4 w-4 text-slate-400" aria-hidden />
            Feature title
          </span>
          <input
            value={feature.title}
            onChange={(event) => updateFeature(feature.id, event.target.value, feature.description)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500/30"
            aria-label={`Feature ${featureNumber} title`}
            placeholder="e.g. Onboarding & first workspace setup"
          />
        </label>

        <label className="block text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <AlignLeft className="h-4 w-4 text-slate-400" aria-hidden />
            Feature details
          </span>
          <textarea
            value={feature.description}
            onChange={(event) => updateFeature(feature.id, feature.title, event.target.value)}
            rows={4}
            placeholder="What should users understand after this feature?"
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500/30"
          />
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Linked demos ({feature.demos.length})
          </p>
          <p className="text-xs text-slate-500">Order matters in learner playback</p>
        </div>
        <RoutePeacockList
          peacocks={feature.demos}
          summariesById={summariesById}
          onRemove={(demoId) => removeDemo(feature.id, demoId)}
          onReorder={(from, to) => reorderDemos(feature.id, from, to)}
        />
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-peacock-300 bg-white px-3 py-2.5 text-sm font-semibold text-peacock-800 transition hover:bg-peacock-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add demo
        </button>
      </div>

      <AddPeacockModal
        isOpen={isPickerOpen}
        summaries={summaries}
        excludedDocumentIds={feature.demos.map((demo) => demo.documentId)}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(documentId) => addDemo(feature.id, documentId)}
      />
    </article>
  );
};
