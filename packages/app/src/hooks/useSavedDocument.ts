import { useEffect, useState } from 'react';
import { getFlowDocument, loadFlowIntoStore } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';

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

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    if (storeDocumentId && storeDocumentId !== documentId) {
      useFlowStore.getState().resetFlow();
    }

    void (async () => {
      const doc = await getFlowDocument(documentId);
      if (cancelled) return;

      if (!doc) {
        setError('This documentation was not found. It may have been deleted.');
        setIsLoading(false);
        return;
      }

      loadFlowIntoStore(doc);
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId, isLoaded, storeDocumentId]);

  return { isLoading, isLoaded: isLoaded && storeDocumentId === documentId, error };
}
