import type { RecordingStateSnapshot } from '@peacock/shared';

export const UI_HOST_ID = 'peacock-recording-ui';

let badgeEl: HTMLDivElement | null = null;
let captureHideDepth = 0;

function ensureUi(onStop: () => void): HTMLDivElement {
  const existing = document.getElementById(UI_HOST_ID) as HTMLDivElement | null;
  if (existing) return existing;

  const host = document.createElement('div');
  host.id = UI_HOST_ID;
  host.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'right: 20px',
    'z-index: 2147483647',
    'display: none',
    'align-items: center',
    'gap: 8px',
    'padding: 10px 12px',
    'border-radius: 999px',
    'background: #111827',
    'color: #fff',
    'font: 12px/1.2 system-ui, sans-serif',
    'box-shadow: 0 8px 24px rgba(0,0,0,0.25)',
  ].join(';');

  badgeEl = document.createElement('div');
  badgeEl.textContent = 'Recording';

  const stopButton = document.createElement('button');
  stopButton.type = 'button';
  stopButton.textContent = 'Stop';
  stopButton.style.cssText = [
    'border: 0',
    'border-radius: 999px',
    'padding: 6px 10px',
    'background: #ef4444',
    'color: #fff',
    'cursor: pointer',
    'font: inherit',
  ].join(';');
  stopButton.addEventListener('click', (event) => {
    event.stopPropagation();
    onStop();
  });

  host.appendChild(badgeEl);
  host.appendChild(stopButton);
  document.body.appendChild(host);

  return host;
}

export function initRecordingUi(onStop: () => void): void {
  ensureUi(onStop);
}

export function hideRecordingUiForCapture(): void {
  const host = document.getElementById(UI_HOST_ID) as HTMLDivElement | null;
  if (!host) return;

  captureHideDepth += 1;
  host.style.display = 'none';
}

export function restoreRecordingUiAfterCapture(state: RecordingStateSnapshot): void {
  if (captureHideDepth === 0) return;

  captureHideDepth -= 1;
  if (captureHideDepth > 0) return;

  updateRecordingUi(state);
}

export function updateRecordingUi(state: RecordingStateSnapshot): void {
  const host = document.getElementById(UI_HOST_ID) as HTMLDivElement | null;
  if (!host || !badgeEl) return;
  if (captureHideDepth > 0) return;

  const isActive = state.status === 'recording' || state.status === 'paused';
  host.style.display = isActive ? 'flex' : 'none';

  if (state.status === 'paused') {
    badgeEl.textContent = `Paused · ${state.eventCount} steps`;
    return;
  }

  badgeEl.textContent = `Recording · ${state.eventCount} steps`;
}
