import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PeacockEmbedWatermark } from '@/components/embed/PeacockEmbedWatermark';
import { EmbedErrorPanel } from '@/components/embed/EmbedErrorPanel';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { LANDING_PATH } from '@/constants/routes';
import { FlowDocExperienceViews } from '@/player/FlowDocExperienceViews';
import { loadFlowIntoStore } from '@/services/flowLibraryService';
import type { SavedFlowDocument } from '@/types/savedFlow';
import { reportAppError } from '@/utils/appError';

const EXAMPLE_SLUGS = new Set(['kachabazar']);

function exampleDocumentUrl(slug: string): string {
  return `/examples/${slug}/document.json`;
}

export const StaticExamplePlayerPage = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!EXAMPLE_SLUGS.has(slug)) {
      setError('This example is not available.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void fetch(exampleDocumentUrl(slug))
      .then(async (response) => {
        if (!response.ok) throw new Error(`Example failed to load (${response.status})`);
        return (await response.json()) as SavedFlowDocument;
      })
      .then((doc) => {
        if (cancelled) return;
        loadFlowIntoStore(doc);
        setDocumentId(doc.id);
      })
      .catch((cause) => {
        if (cancelled) return;
        reportAppError('Load static example', cause);
        setError('This example could not be loaded. Refresh and try again.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading example…</p>
      </div>
    );
  }

  if (error || !documentId) {
    return (
      <EmbedErrorPanel
        title="Example unavailable"
        description={error ?? 'This example could not be loaded.'}
      />
    );
  }

  return (
    <AppErrorBoundary
      compact
      embed
      title="Example crashed"
      description="A rendering error stopped this example. Try refreshing the page."
      homePath={LANDING_PATH}
      homeLabel="Go home"
    >
      <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
        <div className="min-h-0 flex-1 overflow-hidden">
          <FlowDocExperienceViews
            documentId={documentId}
            resolvedView="player"
            onModeChange={() => undefined}
            onOverview={() => undefined}
            showOwnerActions={false}
            isEmbed
          />
        </div>
        <footer className="flex shrink-0 items-center justify-center border-t border-slate-200/80 bg-white/95 px-3 py-2">
          <PeacockEmbedWatermark plan="free" />
        </footer>
      </div>
    </AppErrorBoundary>
  );
};
