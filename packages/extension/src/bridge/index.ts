import {
  CAPTURE_HANDOFF_REQUEST,
  CAPTURE_HANDOFF_RESPONSE,
  HANDOFF_REQUEST,
  HANDOFF_RESPONSE,
  type CaptureHandoffBridgeMessage,
  type CaptureHandoffRequestMessage,
  type HandoffBridgeMessage,
} from '@peacock/shared';

function postToPage(message: HandoffBridgeMessage | CaptureHandoffBridgeMessage): void {
  window.postMessage(message, window.location.origin);
}

function fetchAndPostHandoff(): void {
  chrome.runtime.sendMessage({ type: 'GET_PENDING_HANDOFF' }, (response) => {
    const lastError = chrome.runtime.lastError;

    postToPage({
      type: HANDOFF_RESPONSE,
      ok: !lastError && Boolean(response?.payload),
      payload: response?.payload ?? null,
      screenshotUrls: response?.screenshotUrls ?? {},
      error: lastError?.message ?? response?.error ?? null,
    });
  });
}

function fetchAndPostCapture(captureId: string): void {
  chrome.runtime.sendMessage({ type: 'GET_CAPTURE_RESULT', captureId }, (response) => {
    const lastError = chrome.runtime.lastError;
    const capture = response as CaptureHandoffBridgeMessage | undefined;

    postToPage({
      type: CAPTURE_HANDOFF_RESPONSE,
      ok: !lastError && Boolean(capture?.ok),
      captureId: capture?.captureId,
      mode: capture?.mode,
      imageDataUrl: capture?.imageDataUrl,
      naturalWidth: capture?.naturalWidth,
      naturalHeight: capture?.naturalHeight,
      error: lastError?.message ?? capture?.error ?? null,
    });
  });
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  const data = event.data as CaptureHandoffRequestMessage | { type: string } | undefined;
  if (!data?.type) return;

  if (data.type === HANDOFF_REQUEST) {
    fetchAndPostHandoff();
    return;
  }

  if (data.type === CAPTURE_HANDOFF_REQUEST && 'captureId' in data && data.captureId) {
    fetchAndPostCapture(data.captureId);
  }
});

for (const delayMs of [0, 300, 800, 1500, 3000, 5000]) {
  window.setTimeout(fetchAndPostHandoff, delayMs);
}
