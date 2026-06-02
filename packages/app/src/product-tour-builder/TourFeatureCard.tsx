import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
    <article className="relative z-10 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-3 border-b border-slate-100 p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-peacock-500 to-brand-violet text-sm font-bold text-white">
          {featureNumber}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={feature.title}
            onChange={(event) => updateFeature(feature.id, event.target.value, feature.description)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
            aria-label={`Feature ${featureNumber} title`}
          />
          <textarea
            value={feature.description}
            onChange={(event) => updateFeature(feature.id, feature.title, event.target.value)}
            rows={4}
            placeholder="Feature description (optional)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
          />
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={() => deleteFeature(feature.id)}
            className="h-fit rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
            aria-label={`Delete feature ${featureNumber}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <p className="text-xs font-medium text-slate-500">Demos ({feature.demos.length})</p>
        <RoutePeacockList
          peacocks={feature.demos}
          summariesById={summariesById}
          onRemove={(demoId) => removeDemo(feature.id, demoId)}
          onReorder={(from, to) => reorderDemos(feature.id, from, to)}
        />
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-peacock-200 bg-peacock-50/30 px-3 py-2.5 text-sm font-medium text-peacock-800 hover:bg-peacock-50"
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
