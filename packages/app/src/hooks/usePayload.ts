import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HANDOFF_REQUEST,
  HANDOFF_RESPONSE,
  type HandoffBridgeMessage,
  type HandoffResponse,
} from '@peacock/shared';
import { saveNewFlowFromStore } from '@/services/flowLibraryService';
import { useFlowStore } from '@/store/flowStore';

function getExtensionId(): string | null {
  const fromEnv = import.meta.env.VITE_EXTENSION_ID?.trim();
  return fromEnv || null;
}

function requestHandoffViaBridge(timeoutMs = 12000): Promise<HandoffResponse | null> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: HandoffResponse | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.clearInterval(retryTimer);
      window.removeEventListener('message', onMessage);
      resolve(result);
    };

    let lastBridgeError: string | null = null;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;

      const data = event.data as HandoffBridgeMessage | undefined;
      if (data?.type !== HANDOFF_RESPONSE) return;

      if (data.error) lastBridgeError = data.error;

      if (data.ok && data.payload) {
        finish({ payload: data.payload, screenshotUrls: data.screenshotUrls ?? {} });
      }
    };

    const postRequest = () => {
      window.postMessage({ type: HANDOFF_REQUEST }, window.location.origin);
    };

    window.addEventListener('message', onMessage);
    postRequest();

    const retryTimer = window.setInterval(postRequest, 500);
    const timer = window.setTimeout(() => {
      if (lastBridgeError) {
        console.error('[Peacock] Bridge handoff error:', lastBridgeError);
      }
      finish(null);
    }, timeoutMs);
  });
}

function requestHandoffViaExtensionId(extensionId: string): Promise<HandoffResponse | null> {
  return new Promise((resolve) => {
    const runtime = window.chrome?.runtime;
    if (!runtime?.sendMessage) {
      resolve(null);
      return;
    }

    runtime.sendMessage<HandoffResponse>(
      extensionId,
      { type: 'GET_PENDING_HANDOFF' },
      (response) => {
        if (runtime.lastError || !response?.payload) {
          resolve(null);
          return;
        }
        resolve(response);
      }
    );
  });
}

interface UsePayloadOptions {
  enabled?: boolean;
}

export function usePayload({ enabled = true }: UsePayloadOptions = {}) {
  const navigate = useNavigate();
  const setFlow = useFlowStore((state) => state.setFlow);
  const isLoaded = useFlowStore((state) => state.isLoaded);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || isLoaded) return;

    setIsLoading(true);
    setError(null);

    void (async () => {
      const handoff =
        (await requestHandoffViaBridge()) ??
        (getExtensionId() ? await requestHandoffViaExtensionId(getExtensionId()!) : null);

      setIsLoading(false);

      if (!handoff?.payload) {
        setError(
          'No pending flow from the extension. Record on a website, then stop recording to open the editor.'
        );
        return;
      }

      useFlowStore.getState().resetFlow();
      setFlow(handoff.payload, handoff.screenshotUrls ?? {});

      const documentId = await saveNewFlowFromStore();
      if (documentId) {
        navigate(`/docs/${documentId}/edit`, { replace: true });
      }
    })();
  }, [enabled, isLoaded, setFlow, navigate]);

  return { isLoading, isLoaded, error };
}
