import {
  HANDOFF_REQUEST,
  HANDOFF_RESPONSE,
  type HandoffBridgeMessage,
} from '@peacock/shared';

function postHandoffToPage(response: HandoffBridgeMessage): void {
  window.postMessage(response, window.location.origin);
}

function fetchAndPostHandoff(): void {
  chrome.runtime.sendMessage({ type: 'GET_PENDING_HANDOFF' }, (response) => {
    const lastError = chrome.runtime.lastError;

    postHandoffToPage({
      type: HANDOFF_RESPONSE,
      ok: !lastError && Boolean(response?.payload),
      payload: response?.payload ?? null,
      screenshotUrls: response?.screenshotUrls ?? {},
      error: lastError?.message ?? response?.error ?? null,
    });
  });
}

window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.type !== HANDOFF_REQUEST) return;
  fetchAndPostHandoff();
});

for (const delayMs of [0, 300, 800, 1500, 3000, 5000]) {
  window.setTimeout(fetchAndPostHandoff, delayMs);
}
