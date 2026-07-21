import {
  EXTENSION_PING_REQUEST,
  EXTENSION_PING_RESPONSE,
  type ExtensionPingResponseMessage,
} from '@peacock/shared';
import { getExtensionId } from '@/utils/getExtensionId';

const DEFAULT_TIMEOUT_MS = 1200;

function pingViaBridge(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      resolve(ok);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;
      const data = event.data as ExtensionPingResponseMessage | undefined;
      if (data?.type === EXTENSION_PING_RESPONSE && data.ok) finish(true);
    };

    window.addEventListener('message', onMessage);
    window.postMessage({ type: EXTENSION_PING_REQUEST }, window.location.origin);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
  });
}

function pingViaRuntime(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const runtime = window.chrome?.runtime;
    if (!runtime?.sendMessage) {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(ok);
    };

    const timer = window.setTimeout(() => finish(false), timeoutMs);

    try {
      runtime.sendMessage(getExtensionId(), { type: 'PING' }, () => {
        // lastError means no receiving end (not installed / not connectable).
        finish(!runtime.lastError);
      });
    } catch {
      finish(false);
    }
  });
}

/**
 * Probes whether the Peacock Chrome extension is available on this origin.
 * Tries the content-script bridge first (works on localhost / patched app URLs),
 * then a direct `chrome.runtime.sendMessage` PING as a fallback.
 */
export async function probeExtensionInstalled(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const half = Math.max(200, Math.floor(timeoutMs / 2));
  if (await pingViaBridge(half)) return true;
  return pingViaRuntime(timeoutMs);
}
