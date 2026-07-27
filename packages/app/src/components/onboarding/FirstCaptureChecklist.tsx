import { useState } from 'react';
import { CheckCircle2, Share2, Sparkles, X } from 'lucide-react';

const CHECKLIST_ITEMS = [
  'Review steps and screenshots in the outline',
  'Set a clear title in Flow details',
  'Play the doc, then share when ready',
] as const;

interface FirstCaptureChecklistProps {
  onDismiss: () => void;
}

/** Light post-first-capture success checklist shown after a new doc is saved. */
export const FirstCaptureChecklist = ({ onDismiss }: FirstCaptureChecklistProps) => {
  const [done, setDone] = useState<Record<number, boolean>>({});

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-40 w-full max-w-sm rounded-2xl border border-peacock-200 bg-white p-4 shadow-xl shadow-slate-900/10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-peacock-600" aria-hidden />
            Capture saved to library
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            A few quick next steps to ship your first flow doc.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {CHECKLIST_ITEMS.map((label, index) => {
          const isDone = Boolean(done[index]);
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => setDone((prev) => ({ ...prev, [index]: !prev[index] }))}
                className="flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 shrink-0 ${isDone ? 'text-emerald-500' : 'text-slate-300'}`}
                  aria-hidden
                />
                <span className={isDone ? 'text-slate-400 line-through' : undefined}>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-peacock-700">
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Share stays available after you leave draft status
      </p>
    </div>
  );
};
