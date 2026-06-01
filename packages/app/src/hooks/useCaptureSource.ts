import { useEffect, useState } from 'react';
import {
  CAPTURE_HANDOFF_REQUEST,
  CAPTURE_HANDOFF_RESPONSE,
  toCaptureResultHandoff,
  type CaptureHandoffBridgeMessage,
  type CaptureResultHandoff,
  type ScreenshotToolMode,
} from '@peacock/shared';
import { getExtensionId } from '@/utils/getExtensionId';

export interface CaptureSource {
  captureId: string;
  mode: ScreenshotToolMode;
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

interface UseCaptureSourceResult {
  source: CaptureSource | null;
  isLoading: boolean;
  error: string | null;
}

function loadImageDimensions(imageDataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Could not read screenshot dimensions'));
    image.src = imageDataUrl;
  });
}

function requestCaptureViaBridge(captureId: string, timeoutMs = 12000): Promise<CaptureResultHandoff> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: CaptureResultHandoff) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.clearInterval(retryTimer);
      window.removeEventListener('message', onMessage);
      resolve(result);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;

      const data = event.data as CaptureHandoffBridgeMessage | undefined;
      if (data?.type !== CAPTURE_HANDOFF_RESPONSE) return;

      finish(toCaptureResultHandoff(data));
    };

    const postRequest = () => {
      window.postMessage(
        { type: CAPTURE_HANDOFF_REQUEST, captureId },
        window.location.origin,
      );
    };

    window.addEventListener('message', onMessage);
    postRequest();

    const retryTimer = window.setInterval(postRequest, 500);
    const timer = window.setTimeout(() => {
      finish({
        ok: false,
        error:
          'Peacock extension bridge did not respond. Reload the extension and ensure this app URL is listed in the extension manifest.',
      });
    }, timeoutMs);
  });
}

function requestCaptureViaExtensionId(
  captureId: string,
  extensionId: string,
): Promise<CaptureResultHandoff> {
  return new Promise((resolve) => {
    const runtime = window.chrome?.runtime;
    if (!runtime?.sendMessage) {
      resolve({ ok: false, error: 'Extension messaging is not available in this browser.' });
      return;
    }

    runtime.sendMessage<CaptureResultHandoff>(
      extensionId,
      { type: 'GET_CAPTURE_RESULT', captureId },
      (response) => {
        if (runtime.lastError) {
          resolve({ ok: false, error: runtime.lastError.message ?? 'Extension unreachable' });
          return;
        }
        resolve(response ?? { ok: false, error: 'Empty response from extension' });
      },
    );
  });
}

export function useCaptureSource(captureId: string | undefined): UseCaptureSourceResult {
  const [source, setSource] = useState<CaptureSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!captureId) {
      setSource(null);
      setError('Missing capture id.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      const extensionId = getExtensionId();
      const bridgeHandoff = await requestCaptureViaBridge(captureId);
      const handoff =
        bridgeHandoff.ok
          ? bridgeHandoff
          : extensionId
            ? await requestCaptureViaExtensionId(captureId, extensionId)
            : bridgeHandoff;

      if (cancelled) return;

      if (!handoff.ok || !handoff.imageDataUrl || !handoff.captureId || !handoff.mode) {
        setSource(null);
        setError(
          handoff.error ??
            'Could not load this capture. Open the screenshot preview from the extension first, then click Edit.',
        );
        setIsLoading(false);
        return;
      }

      let naturalWidth = handoff.naturalWidth ?? 0;
      let naturalHeight = handoff.naturalHeight ?? 0;

      if (!naturalWidth || !naturalHeight) {
        try {
          const dimensions = await loadImageDimensions(handoff.imageDataUrl);
          naturalWidth = dimensions.width;
          naturalHeight = dimensions.height;
        } catch (dimensionError) {
          setSource(null);
          setError(
            dimensionError instanceof Error
              ? dimensionError.message
              : 'Could not read screenshot dimensions',
          );
          setIsLoading(false);
          return;
        }
      }

      setSource({
        captureId: handoff.captureId,
        mode: handoff.mode,
        imageDataUrl: handoff.imageDataUrl,
        naturalWidth,
        naturalHeight,
      });
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [captureId]);

  return { source, isLoading, error };
}
