import { getPlayableSteps, getStepScreenshotUrl } from '@peacock/shared';
import { useEffect, useMemo, useState } from 'react';
import { isCloudHostedScreenshotUrl } from '@/cloud/cloudInitErrors';
import { isInlineScreenshotUrl } from '@/cloud/screenshotUtils';
import { filterOutlineForViewer } from '@/utils/flowShareSettings';
import { useFlowStore } from '@/store/flowStore';
import {
  clearPrefetchedImages,
  isImagePrefetched,
  prefetchImages,
} from '@/utils/prefetchImages';

function buildPrefetchKey(
  stepScreenshotPairs: Array<{ stepId: string; url: string | null }>,
): string {
  return stepScreenshotPairs.map(({ stepId, url }) => `${stepId}:${url ?? ''}`).join('|');
}

function areAllUrlsReady(urls: string[]): boolean {
  return urls.every((url) => isInlineScreenshotUrl(url) || isImagePrefetched(url));
}

export interface PrefetchFlowScreenshotsState {
  areScreenshotsReady: boolean;
  /** True when cloud-hosted screenshots failed to load (often corporate 403 / network block). */
  screenshotsNetworkBlocked: boolean;
}

export function usePrefetchFlowScreenshots(
  documentId: string | undefined,
  enabled: boolean,
): PrefetchFlowScreenshotsState {
  const storeDocumentId = useFlowStore((state) => state.documentId);
  const steps = useFlowStore((state) => state.steps);
  const viewerFilter = useFlowStore((state) => state.viewerFilter);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const [areScreenshotsReady, setAreScreenshotsReady] = useState(() => !enabled);
  const [screenshotsNetworkBlocked, setScreenshotsNetworkBlocked] = useState(false);

  const outline = useMemo(
    () => filterOutlineForViewer(steps, viewerFilter),
    [steps, viewerFilter],
  );

  const prefetchKey = useMemo(() => {
    const playableSteps = getPlayableSteps(outline);
    return buildPrefetchKey(
      playableSteps.map((step) => ({
        stepId: step.id,
        url: getStepScreenshotUrl(step, screenshotUrls),
      })),
    );
  }, [outline, screenshotUrls]);

  useEffect(() => {
    if (!enabled || !documentId || storeDocumentId !== documentId) {
      setAreScreenshotsReady(true);
      setScreenshotsNetworkBlocked(false);
      return;
    }

    const playableSteps = getPlayableSteps(outline);
    const urls = playableSteps
      .map((step) => getStepScreenshotUrl(step, screenshotUrls))
      .filter((url): url is string => Boolean(url));

    if (!urls.length || areAllUrlsReady(urls)) {
      setAreScreenshotsReady(true);
      setScreenshotsNetworkBlocked(false);
      return;
    }

    setAreScreenshotsReady(false);
    setScreenshotsNetworkBlocked(false);
    clearPrefetchedImages();

    const controller = new AbortController();

    void prefetchImages(urls, {
      priorityUrl: urls[0] ?? null,
      signal: controller.signal,
    }).then((result) => {
      if (controller.signal.aborted) return;
      const cloudFailed = result.failed.some((url) => isCloudHostedScreenshotUrl(url));
      const cloudLoaded = result.loaded.some((url) => isCloudHostedScreenshotUrl(url));
      // Surface corporate-block UI when cloud shots fail and none loaded (typical 403/proxy).
      setScreenshotsNetworkBlocked(cloudFailed && !cloudLoaded);
      setAreScreenshotsReady(true);
    });

    return () => {
      controller.abort();
      clearPrefetchedImages();
    };
  }, [documentId, enabled, storeDocumentId, prefetchKey, outline, screenshotUrls]);

  return { areScreenshotsReady, screenshotsNetworkBlocked };
}
