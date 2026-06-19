import { AlertTriangle, Layers3 } from 'lucide-react';

interface DeleteProductTourConfirmContentProps {
  title: string;
  featureCount: number;
  demoCount: number;
}

export const DeleteProductTourConfirmContent = ({
  title,
  featureCount,
  demoCount,
}: DeleteProductTourConfirmContentProps) => (
  <div className="mt-4 space-y-4">
    <div className="overflow-hidden rounded-xl border border-red-200/80 bg-gradient-to-br from-red-50 via-white to-slate-50 p-4 ring-1 ring-red-100/80">
      <div className="flex items-start gap-3">
        <span className="inline-flex shrink-0 rounded-lg bg-red-100 p-2 text-red-600">
          <Layers3 className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700/90">
            Product tour to delete
          </p>
          <p className="mt-1.5 line-clamp-3 text-base font-semibold leading-snug text-slate-900" title={title}>
            {title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-brand-violet/10 px-2.5 py-0.5 text-xs font-semibold text-brand-violet ring-1 ring-brand-violet/20">
              {featureCount} {featureCount === 1 ? 'feature' : 'features'}
            </span>
            <span className="inline-flex items-center rounded-full bg-peacock-50 px-2.5 py-0.5 text-xs font-semibold text-peacock-700 ring-1 ring-peacock-100">
              {demoCount} {demoCount === 1 ? 'demo' : 'demos'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
      <span>
        This product tour will be permanently removed from this device.
        <span className="font-medium text-slate-800"> This cannot be undone.</span>
      </span>
    </p>
  </div>
);
