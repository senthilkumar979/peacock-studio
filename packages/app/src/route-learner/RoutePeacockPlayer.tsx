import { useEffect, useState } from 'react';
import { getFlowDocument } from '@/services/flowLibraryService';
import { PlayerStep } from '@/player/PlayerStep';
import type { SavedFlowDocument } from '@/types/savedFlow';

interface RoutePeacockPlayerProps {
  documentId: string;
  stepIndex: number;
  onDocumentLoaded: (stepCount: number) => void;
}

export const RoutePeacockPlayer = ({
  documentId,
  stepIndex,
  onDocumentLoaded,
}: RoutePeacockPlayerProps) => {
  const [document, setDocument] = useState<SavedFlowDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void getFlowDocument(documentId)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          setDocument(null);
          setError('This demo is no longer available.');
          onDocumentLoaded(0);
          return;
        }
        setDocument(doc);
        onDocumentLoaded(doc.steps.length);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this demo.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, onDocumentLoaded]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading demo…
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-amber-800">
        {error ?? 'Demo unavailable'}
      </div>
    );
  }

  const step = document.steps[stepIndex];

  if (!step) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        This demo has no steps to show.
      </div>
    );
  }

  return (
    <PlayerStep
      step={step}
      stepNumber={stepIndex + 1}
      screenshotUrls={document.screenshotUrls}
    />
  );
};
