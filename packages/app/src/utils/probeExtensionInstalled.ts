import {
  EXTENSION_PING_REQUEST,
  EXTENSION_PING_RESPONSE,
  HANDOFF_REQUEST,
  HANDOFF_RESPONSE,
  type ExtensionPingResponseMessage,
  type HandoffBridgeMessage,
} from '@peacock/shared';
import { getExtensionId } from '@/utils/getExtensionId';

const DEFAULT_TIMEOUT_MS = 2000;

/** Set by the extension bridge content script when it loads on this origin. */
export const EXTENSION_DOM_MARKER = 'data-peacock-extension';

function isBridgePresentInDom(): boolean {
  return document.documentElement.getAttribute(EXTENSION_DOM_MARKER) === 'installed';
}

/**
 * Asks the content-script bridge to identify itself. Compatible with the
 * published Web Store build (which answers HANDOFF_REQUEST) and with newer
 * builds that also answer EXTENSION_PING_REQUEST.
 */
function pingViaBridge(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (isBridgePresentInDom()) {
      resolve(true);
      return;
    }

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

      const data = event.data as
        | ExtensionPingResponseMessage
        | HandoffBridgeMessage
        | { type?: string }
        | undefined;

      if (!data?.type) return;

      // Any bridge reply proves the extension content script is on this page.
      if (data.type === EXTENSION_PING_RESPONSE || data.type === HANDOFF_RESPONSE) {
        finish(true);
      }
    };

    window.addEventListener('message', onMessage);
    window.postMessage({ type: EXTENSION_PING_REQUEST }, window.location.origin);
    window.postMessage({ type: HANDOFF_REQUEST }, window.location.origin);
    const timer = window.setTimeout(() => finish(isBridgePresentInDom()), timeoutMs);
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
      // Prefer messages the published build may already route; PING is for newer builds.
      runtime.sendMessage(getExtensionId(), { type: 'GET_PENDING_HANDOFF' }, () => {
        if (!runtime.lastError) {
          finish(true);
          return;
        }
        runtime.sendMessage(getExtensionId(), { type: 'PING' }, () => {
          finish(!runtime.lastError);
        });
      });
    } catch {
      finish(false);
    }
  });
}

/**
 * Probes whether the Peacock Chrome extension is available on this origin.
 * Uses the content-script bridge (including the published store build's handoff
 * protocol), then a direct runtime message as a fallback.
 */
export async function probeExtensionInstalled(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isBridgePresentInDom()) return true;

  if (await pingViaBridge(timeoutMs)) return true;
  return pingViaRuntime(timeoutMs);
}
