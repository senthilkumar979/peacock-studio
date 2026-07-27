import type { RecordingStateSnapshot } from '@peacock/shared';

export const UI_HOST_ID = 'peacock-recording-ui';

let fabButton: HTMLButtonElement | null = null;
let fabCountEl: HTMLSpanElement | null = null;
let statusEl: HTMLSpanElement | null = null;
let panelEl: HTMLDivElement | null = null;
let captureHideDepth = 0;
let isPanelExpanded = false;
let lastState: RecordingStateSnapshot | null = null;

function formatFabCount(eventCount: number): string {
  return String(eventCount);
}

function formatRecordingStatus(state: RecordingStateSnapshot): string {
  const label = state.status === 'paused' ? 'Paused' : 'Recording';
  return `${label} · ${state.eventCount} steps`;
}

function formatFabAriaLabel(state: RecordingStateSnapshot): string {
  const label = state.status === 'paused' ? 'Paused' : 'Recording';
  return `${label}: ${state.eventCount} steps captured`;
}

function createActionButton(label: string, background: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.style.cssText = [
    'border: 0',
    'border-radius: 999px',
    'padding: 6px 10px',
    `background: ${background}`,
    'color: #fff',
    'cursor: pointer',
    'font: inherit',
    'white-space: nowrap',
  ].join(';');
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

function setExpanded(expanded: boolean): void {
  isPanelExpanded = expanded;
  if (!fabButton || !panelEl) return;

  fabButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  panelEl.hidden = !expanded;
}

function updateLabels(state: RecordingStateSnapshot): void {
  if (!fabButton || !fabCountEl || !statusEl) return;

  fabCountEl.textContent = formatFabCount(state.eventCount);
  statusEl.textContent = formatRecordingStatus(state);
  fabButton.setAttribute('aria-label', formatFabAriaLabel(state));
}

function ensureUi(onStop: () => void, onCaptureScreenshot: () => void): HTMLDivElement {
  const existing = document.getElementById(UI_HOST_ID) as HTMLDivElement | null;
  if (existing) return existing;

  const host = document.createElement('div');
  host.id = UI_HOST_ID;
  host.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'left: 20px',
    'z-index: 2147483647',
    'display: none',
    'pointer-events: none',
    'font: 12px/1.2 system-ui, sans-serif',
  ].join(';');

  const inner = document.createElement('div');
  inner.style.cssText = [
    'display: flex',
    'align-items: center',
    'gap: 8px',
    'pointer-events: auto',
  ].join(';');

  fabButton = document.createElement('button');
  fabButton.type = 'button';
  fabButton.setAttribute('data-peacock-fab', '');
  fabButton.setAttribute('aria-expanded', 'false');
  fabButton.setAttribute('aria-label', 'Recording controls');
  fabButton.style.cssText = [
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'width: 48px',
    'height: 48px',
    'border: 0',
    'border-radius: 999px',
    'background: #111827',
    'color: #fff',
    'cursor: pointer',
    'font: 700 14px/1 system-ui, sans-serif',
    'box-shadow: 0 8px 24px rgba(0,0,0,0.25)',
    'flex-shrink: 0',
  ].join(';');

  fabCountEl = document.createElement('span');
  fabCountEl.setAttribute('data-peacock-fab-count', '');
  fabCountEl.textContent = '0';
  fabButton.appendChild(fabCountEl);

  fabButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!isPanelExpanded) setExpanded(true);
  });

  panelEl = document.createElement('div');
  panelEl.setAttribute('data-peacock-panel', '');
  panelEl.hidden = true;
  panelEl.style.cssText = [
    'display: flex',
    'align-items: center',
    'gap: 8px',
    'padding: 10px 12px',
    'border-radius: 999px',
    'background: #111827',
    'color: #fff',
    'box-shadow: 0 8px 24px rgba(0,0,0,0.25)',
  ].join(';');

  statusEl = document.createElement('span');
  statusEl.setAttribute('data-peacock-status', '');
  statusEl.textContent = 'Recording · 0 steps';
  statusEl.style.whiteSpace = 'nowrap';

  const captureButton = createActionButton('Capture Screenshot', '#2563eb', onCaptureScreenshot);
  const stopButton = createActionButton('Stop', '#ef4444', onStop);

  const collapseButton = document.createElement('button');
  collapseButton.type = 'button';
  collapseButton.setAttribute('data-peacock-collapse', '');
  collapseButton.setAttribute('aria-label', 'Collapse recording controls');
  collapseButton.textContent = '×';
  collapseButton.style.cssText = [
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'width: 32px',
    'height: 32px',
    'border: 0',
    'border-radius: 999px',
    'background: #374151',
    'color: #fff',
    'cursor: pointer',
    'font: 18px/1 system-ui, sans-serif',
    'flex-shrink: 0',
  ].join(';');
  collapseButton.addEventListener('click', (event) => {
    event.stopPropagation();
    setExpanded(false);
  });

  panelEl.appendChild(statusEl);
  panelEl.appendChild(captureButton);
  panelEl.appendChild(stopButton);
  panelEl.appendChild(collapseButton);

  inner.appendChild(fabButton);
  inner.appendChild(panelEl);
  host.appendChild(inner);
  document.body.appendChild(host);

  return host;
}

export function initRecordingUi(onStop: () => void, onCaptureScreenshot: () => void): void {
  ensureUi(onStop, onCaptureScreenshot);
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
  if (!host || !fabButton || !fabCountEl || !statusEl) return;
  if (captureHideDepth > 0) return;

  const isActive = state.status === 'recording' || state.status === 'paused';
  const wasActive = lastState?.status === 'recording' || lastState?.status === 'paused';

  if (!isActive) {
    host.style.display = 'none';
    setExpanded(false);
    lastState = state;
    return;
  }

  if (!wasActive) {
    setExpanded(false);
  }

  host.style.display = 'block';
  updateLabels(state);
  lastState = state;
}
