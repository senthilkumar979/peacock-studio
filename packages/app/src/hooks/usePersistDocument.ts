import { useEffect, useRef } from 'react';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';

const PERSIST_DEBOUNCE_MS = 1500;

export function usePersistDocument(enabled: boolean): void {
  const documentId = useFlowStore((state) => state.documentId);
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const flow = useFlowStore((state) => state.flow);
  const steps = useFlowStore((state) => state.steps);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !documentId || !isLoaded || !flow) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      void persistCurrentFlow(documentId).catch((error) => {
        console.error('[Peacock] Failed to persist flow document', error);
      });
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, documentId, isLoaded, flow, steps, screenshotUrls]);
}
