import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface PendingCaptureBarProps {
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export const PendingCaptureBar = ({
  isSaving,
  onSave,
  onDiscard,
}: PendingCaptureBarProps) => (
  <div
    className="border-b border-amber-200 bg-amber-50 px-4 py-3"
    role="status"
    aria-live="polite"
  >
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-amber-950">Review before saving</p>
        <p className="text-sm text-amber-900/80">
          Your capture is only on this device until you save. Discard to remove it without syncing.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onDiscard}
          disabled={isSaving}
        >
          Discard
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className={isSaving ? 'gap-2' : undefined}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            'Save to library'
          )}
        </Button>
      </div>
    </div>
  </div>
);
