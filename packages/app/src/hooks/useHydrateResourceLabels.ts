import { useEffect, useMemo, useRef } from 'react';
import { persistCurrentFlow } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';
import { hydrateResourceLabel } from '@/utils/hydrateResourceLabel';

function unlabeledResourceKey(
  resources: Array<{ id: string; url: string; label?: string }>,
): string {
  return resources
    .filter((resource) => !resource.label?.trim())
    .map((resource) => `${resource.id}:${resource.url}`)
    .join('|');
}

export function useHydrateResourceLabels(enabled: boolean, persist = false): void {
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const documentId = useFlowStore((state) => state.documentId);
  const stepResources = useFlowStore((state) => state.stepResources);
  const attemptedRef = useRef(new Set<string>());
  const pendingKey = useMemo(() => unlabeledResourceKey(stepResources), [stepResources]);

  useEffect(() => {
    attemptedRef.current.clear();
  }, [documentId]);

  useEffect(() => {
    if (!enabled || !isLoaded || !pendingKey) return;

    const pending = useFlowStore
      .getState()
      .stepResources.filter((resource) => !resource.label?.trim())
      .filter((resource) => {
        const key = `${resource.id}:${resource.url}`;
        if (attemptedRef.current.has(key)) return false;
        attemptedRef.current.add(key);
        return true;
      });
    if (pending.length === 0) return;

    let cancelled = false;

    void Promise.all(pending.map((resource) => hydrateResourceLabel(resource.id, resource.url))).then(
      (results) => {
        if (cancelled || !persist || !documentId) return;
        if (!results.some(Boolean)) return;
        void persistCurrentFlow(documentId).catch(() => undefined);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [documentId, enabled, isLoaded, pendingKey, persist]);
}
