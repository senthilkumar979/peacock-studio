import { ArrowRightLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { EmptyFlowState } from '@/components/EmptyFlowState';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useKeyboard } from '@/hooks/useKeyboard';
import { getFlowDocument, listFlowSummaries } from '@/services/flowLibraryService';
import { getPlayableSteps } from '@peacock/shared';
import type { SavedFlowDocument, SavedFlowSummary } from '@/types/savedFlow';
import { CompareDocumentPane } from '@/player/CompareDocumentPane';

function useComparedDocument(documentId: string) {
  const [document, setDocument] = useState<SavedFlowDocument | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(documentId));

  useEffect(() => {
    if (!documentId) {
      setDocument(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void getFlowDocument(documentId)
      .then((next) => {
        if (!cancelled) setDocument(next ?? null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return { document, isLoading };
}

export const CompareDocs = () => {
  const [summaries, setSummaries] = useState<SavedFlowSummary[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const leftDoc = useComparedDocument(leftId);
  const rightDoc = useComparedDocument(rightId);

  useEffect(() => {
    void listFlowSummaries()
      .then((next) => {
        setSummaries(next);
        setError(null);
      })
      .catch((err) => {
        console.error('[Peacock] Failed to load compare summaries', err);
        setError('Could not load saved documentation.');
      })
      .finally(() => setIsLibraryLoading(false));
  }, []);

  useEffect(() => {
    if (!summaries.length) return;
    setLeftId((current) => (current && summaries.some((summary) => summary.id === current) ? current : summaries[0]?.id ?? ''));
    setRightId((current) => (current && summaries.some((summary) => summary.id === current) ? current : summaries[1]?.id ?? summaries[0]?.id ?? ''));
  }, [summaries]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [leftId, rightId]);

  const totalSteps = useMemo(() => {
    const leftCount = leftDoc.document ? getPlayableSteps(leftDoc.document.steps).length : 0;
    const rightCount = rightDoc.document ? getPlayableSteps(rightDoc.document.steps).length : 0;
    return Math.max(leftCount, rightCount);
  }, [leftDoc.document, rightDoc.document]);

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(totalSteps - 1, 0)));
  }, [totalSteps]);

  useKeyboard({
    ArrowRight: () => setCurrentIndex((index) => Math.min(index + 1, Math.max(totalSteps - 1, 0))),
    ArrowLeft: () => setCurrentIndex((index) => Math.max(index - 1, 0)),
  });

  if (isLibraryLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading compare workspace…</p>
      </div>
    );
  }

  if (error) return <EmptyFlowState title="Compare unavailable" description={error} />;
  if (!summaries.length) return <EmptyFlowState title="No docs to compare" description="Record or save documentation first, then compare two flows side by side." />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        eyebrow="Peacock Compare"
        title="Compare Docs"
        description="Select two documents and navigate both step-by-step together."
        homeLink
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <ArrowRightLeft className="h-4 w-4 text-peacock-600" aria-hidden />
                Compare the same step number across both documents.
              </p>
              <p className="text-sm text-slate-500">Step {Math.min(currentIndex + 1, Math.max(totalSteps, 1))} of {Math.max(totalSteps, 1)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
                disabled={currentIndex === 0}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous step
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => Math.min(index + 1, Math.max(totalSteps - 1, 0)))}
                disabled={currentIndex >= totalSteps - 1}
                className="btn-peacock disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next step
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <CompareDocumentPane label="Left document" summaries={summaries} selectedId={leftId} onSelect={setLeftId} document={leftDoc.document} isLoading={leftDoc.isLoading} currentIndex={currentIndex} />
          <CompareDocumentPane label="Right document" summaries={summaries} selectedId={rightId} onSelect={setRightId} document={rightDoc.document} isLoading={rightDoc.isLoading} currentIndex={currentIndex} />
        </div>
      </main>
    </div>
  );
};
