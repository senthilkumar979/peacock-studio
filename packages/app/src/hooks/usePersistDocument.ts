import { useEffect, useRef } from 'react';
import { trackDocumentFirstSaved } from '@/analytics/analyticsClient';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';
import { notifyPersistError } from '@/utils/notify';

const PERSIST_DEBOUNCE_MS = 1500;

export function usePersistDocument(enabled: boolean, routeDocumentId?: string): void {
  const storeDocumentId = useFlowStore((state) => state.documentId);
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const flow = useFlowStore((state) => state.flow);
  const steps = useFlowStore((state) => state.steps);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const stepResources = useFlowStore((state) => state.stepResources);
  const documentId = storeDocumentId ?? routeDocumentId ?? null;

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !routeDocumentId || storeDocumentId) return;
    useFlowStore.getState().setDocumentId(routeDocumentId);
  }, [enabled, routeDocumentId, storeDocumentId]);

  useEffect(() => {
    if (!enabled || !documentId || !isLoaded || !flow) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      void persistCurrentFlow(documentId)
        .then(() => {
          trackDocumentFirstSaved(documentId, {
            step_count: useFlowStore.getState().steps.length,
          });
        })
        .catch((error) => {
          notifyPersistError(error, 'Save documentation');
        });
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // Status is persisted via persistDocumentStatus — do not full-save on status toggles.
  }, [enabled, documentId, isLoaded, flow, steps, screenshotUrls, stepResources]);
}
