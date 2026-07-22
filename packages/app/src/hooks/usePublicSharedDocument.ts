import { useEffect } from 'react';
import { type FlowViewerFilter } from '@/utils/flowShareSettings';
import { loadFlowIntoStore } from '@/services/flowLibraryService';
import { getFlowDocument } from '@/storage/libraryRouter';
import { useFlowStore } from '@/store/flowStore';
import type { ResolvedShareLink } from '@/types/shareLink';

function buildViewerFilterFromShareLink(link: ResolvedShareLink): FlowViewerFilter | null {
  const shareSettings = link.settings.shareSettings;
  if (!shareSettings) return null;

  return {
    includeMainFlow: shareSettings.includeMainFlow,
    enabledPathIds: new Set(shareSettings.enabledPathIds),
    enabledBranchIds: new Set(shareSettings.enabledBranchIds),
  };
}

export function usePublicSharedDocument(link: ResolvedShareLink | null) {
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const storeDocumentId = useFlowStore((state) => state.documentId);
  const setViewerFilter = useFlowStore((state) => state.setViewerFilter);

  useEffect(() => {
    if (!link || link.resourceType !== 'document') return;

    let cancelled = false;

    void getFlowDocument(link.resourceId).then((doc) => {
      if (cancelled || !doc) return;

      loadFlowIntoStore(doc);

      const filter = buildViewerFilterFromShareLink(link);
      if (filter) setViewerFilter(filter);
    });

    return () => {
      cancelled = true;
      setViewerFilter(null);
    };
  }, [link, setViewerFilter]);

  const shareLinkViewMode = link?.settings.viewMode ?? null;
  const isReady =
    Boolean(link) &&
    link?.resourceType === 'document' &&
    isLoaded &&
    storeDocumentId === link.resourceId;

  return { shareLinkViewMode, isReady };
}
