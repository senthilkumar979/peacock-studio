import {
  EXTENSION_PING_REQUEST,
  EXTENSION_PING_RESPONSE,
  HANDOFF_REQUEST,
  HANDOFF_RESPONSE,
  type ExtensionPingResponseMessage,
  type HandoffBridgeMessage,
} from '@peacock/shared';
import { getConfiguredExtensionIds } from '@/utils/getExtensionId';

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

function pingOneExtensionId(
  runtime: NonNullable<NonNullable<Window['chrome']>['runtime']>,
  extensionId: string,
  timeoutMs: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(ok);
    };

    const timer = window.setTimeout(() => finish(false), timeoutMs);

    try {
      runtime.sendMessage(extensionId, { type: 'GET_PENDING_HANDOFF' }, () => {
        if (!runtime.lastError) {
          finish(true);
          return;
        }
        runtime.sendMessage(extensionId, { type: 'PING' }, () => {
          finish(!runtime.lastError);
        });
      });
    } catch {
      finish(false);
    }
  });
}

async function pingViaRuntime(timeoutMs: number): Promise<boolean> {
  const runtime = window.chrome?.runtime;
  if (!runtime?.sendMessage) return false;

  const ids = getConfiguredExtensionIds();
  if (ids.length === 0) return false;

  const perIdTimeout = Math.max(400, Math.floor(timeoutMs / ids.length));
  for (const id of ids) {
    if (await pingOneExtensionId(runtime, id, perIdTimeout)) return true;
  }
  return false;
}

/**
 * Probes whether the Peacock browser extension is available on this origin.
 * Uses the content-script bridge first, then direct runtime messages to every
 * configured store / unpacked extension ID.
 */
export async function probeExtensionInstalled(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isBridgePresentInDom()) return true;

  if (await pingViaBridge(timeoutMs)) return true;
  return pingViaRuntime(timeoutMs);
}
