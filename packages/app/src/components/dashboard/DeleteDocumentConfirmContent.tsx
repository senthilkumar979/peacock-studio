import { AlertTriangle, FileText } from 'lucide-react';
import { FlowStepCountBadge } from './FlowStepCountBadge';

interface DeleteDocumentConfirmContentProps {
  title: string;
  stepCount: number;
}

export const DeleteDocumentConfirmContent = ({
  title,
  stepCount,
}: DeleteDocumentConfirmContentProps) => (
  <div className="mt-4 space-y-4">
    <div className="overflow-hidden rounded-xl border border-red-200/80 bg-gradient-to-br from-red-50 via-white to-slate-50 p-4 ring-1 ring-red-100/80">
      <div className="flex items-start gap-3">
        <span className="inline-flex shrink-0 rounded-lg bg-red-100 p-2 text-red-600">
          <FileText className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700/90">
            Documentation to delete
          </p>
          <p className="mt-1.5 line-clamp-3 text-base font-semibold leading-snug text-slate-900" title={title}>
            {title}
          </p>
          <div className="mt-3">
            <FlowStepCountBadge stepCount={stepCount} />
          </div>
        </div>
      </div>
    </div>

    <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
      <span>
        This documentation and all {stepCount} {stepCount === 1 ? 'step' : 'steps'} will be
        permanently removed from this device.
        <span className="font-medium text-slate-800"> This cannot be undone.</span>
      </span>
    </p>
  </div>
);
