import { useEffect, useState } from 'react';
import { getFlowDocument, loadFlowIntoStore } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';
import type { SavedFlowDocument } from '@/types/savedFlow';
import { reportAppError } from '@/utils/appError';

function assertReadableSavedFlowDocument(doc: SavedFlowDocument): void {
  const flowMeta = doc.flow?.flow;
  if (!flowMeta || typeof flowMeta !== 'object' || !Array.isArray(doc.steps)) {
    const err = new Error('Corrupt or unparseable document payload');
    err.name = 'CorruptDocumentPayloadError';
    throw err;
  }
}

export function useSavedDocument(documentId: string | undefined) {
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const storeDocumentId = useFlowStore((state) => state.documentId);
  const [isLoading, setIsLoading] = useState(Boolean(documentId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setIsLoading(false);
      setError('Missing document id.');
      return;
    }

    if (isLoaded && storeDocumentId === documentId) {
      setIsLoading(false);
      setError(null);
      return;
    }

    if (isLoaded && !storeDocumentId && documentId) {
      useFlowStore.getState().setDocumentId(documentId);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    if (storeDocumentId && storeDocumentId !== documentId) {
      useFlowStore.getState().resetFlow();
    }

    void (async () => {
      try {
        const doc = await getFlowDocument(documentId);
        if (cancelled) return;

        if (!doc) {
          setError('This documentation was not found. It may have been deleted.');
          setIsLoading(false);
          return;
        }

        assertReadableSavedFlowDocument(doc);
        loadFlowIntoStore(doc);
        if (!cancelled) setIsLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        const classified = reportAppError('Load saved documentation', loadError);
        setError(classified.userMessage);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId, isLoaded, storeDocumentId]);

  return { isLoading, isLoaded: isLoaded && storeDocumentId === documentId, error };
}
