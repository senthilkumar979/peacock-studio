import type { RecordingStateSnapshot } from '@peacock/shared';
import { sendExtensionMessage } from '../src/messaging/sendExtensionMessage';

const logoEl = document.getElementById('logo') as HTMLImageElement;
const pageHostEl = document.getElementById('page-host') as HTMLParagraphElement;
const eventCountEl = document.getElementById('event-count') as HTMLParagraphElement;
const elapsedEl = document.getElementById('elapsed') as HTMLParagraphElement;
const statusEl = document.getElementById('status') as HTMLParagraphElement;
const statusDetailEl = document.getElementById('status-detail') as HTMLParagraphElement;
const statusBadgeEl = document.getElementById('status-badge') as HTMLDivElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const resumeBtn = document.getElementById('resume-btn') as HTMLButtonElement;
const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;
const openDashboardBtn = document.getElementById('open-dashboard-btn') as HTMLButtonElement;
const openEditorBtn = document.getElementById('open-editor-btn') as HTMLButtonElement;

logoEl.src = chrome.runtime.getURL('logo.png');

let lastState: RecordingStateSnapshot | null = null;
let isBusy = false;

const editorUrl = import.meta.env.VITE_APP_URL;
const dashboardUrl = (() => {
  try {
    const url = new URL(editorUrl);
    return `${url.origin}/`;
  } catch {
    return 'http://localhost:5173/';
  }
})();

function formatElapsed(startedAt: number | null): string {
  if (!startedAt) return 'Ready';
  const totalSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function getCurrentPageLabel(): Promise<string> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.url) return 'No active page';

  try {
    const url = new URL(activeTab.url);
    return url.hostname.replace(/^www\./, '') || activeTab.title || 'Current tab';
  } catch {
    return activeTab.title || 'Browser tab';
  }
}

function setButtonsDisabled(disabled: boolean): void {
  startBtn.disabled = disabled;
  pauseBtn.disabled = disabled;
  resumeBtn.disabled = disabled;
  stopBtn.disabled = disabled;
}

function renderState(state: RecordingStateSnapshot): void {
  lastState = state;
  eventCountEl.textContent = String(state.eventCount);
  elapsedEl.textContent = formatElapsed(state.startedAt);

  startBtn.hidden = state.status !== 'idle';
  pauseBtn.hidden = state.status !== 'recording';
  resumeBtn.hidden = state.status !== 'paused';
  stopBtn.hidden = state.status === 'idle';
  setButtonsDisabled(isBusy);

  statusBadgeEl.className = `status-badge status-badge--${state.status}`;

  if (state.status === 'recording') {
    statusBadgeEl.textContent = 'Recording';
    statusEl.textContent = 'Recording actions on the current tab.';
    statusDetailEl.textContent =
      'Clicks, inputs, navigation, and screenshots are being captured live.';
    return;
  }

  if (state.status === 'paused') {
    statusBadgeEl.textContent = 'Paused';
    statusEl.textContent = 'Recording is paused.';
    statusDetailEl.textContent =
      'Resume when you are ready to continue the same flow.';
    return;
  }

  statusBadgeEl.textContent = 'Idle';
  statusEl.textContent = 'Ready to record this tab.';
  statusDetailEl.textContent =
    'Start recording without refreshing the page, then stop to open the editor.';
}

async function refreshState(): Promise<void> {
  try {
    const [state, pageLabel] = await Promise.all([
      sendExtensionMessage<RecordingStateSnapshot>({ type: 'GET_RECORDING_STATE' }),
      getCurrentPageLabel(),
    ]);
    pageHostEl.textContent = pageLabel;
    renderState(state);
  } catch (error) {
    statusEl.textContent = 'Could not load extension state.';
    statusDetailEl.textContent =
      error instanceof Error ? error.message : 'Try reopening the popup.';
  }
}

async function runAction(
  message: 'START_RECORDING' | 'PAUSE_RECORDING' | 'RESUME_RECORDING' | 'STOP_RECORDING'
): Promise<void> {
  isBusy = true;
  setButtonsDisabled(true);
  try {
    await sendExtensionMessage({ type: message });
    await refreshState();
  } finally {
    isBusy = false;
    if (lastState) setButtonsDisabled(false);
  }
}

async function openUrl(url: string): Promise<void> {
  await chrome.tabs.create({ url });
}

startBtn.addEventListener('click', () => void runAction('START_RECORDING'));
pauseBtn.addEventListener('click', () => void runAction('PAUSE_RECORDING'));
resumeBtn.addEventListener('click', () => void runAction('RESUME_RECORDING'));
stopBtn.addEventListener('click', () => void runAction('STOP_RECORDING'));
openDashboardBtn.addEventListener('click', () => void openUrl(dashboardUrl));
openEditorBtn.addEventListener('click', () => void openUrl(editorUrl));

void refreshState();
window.setInterval(() => {
  if (lastState?.startedAt) elapsedEl.textContent = formatElapsed(lastState.startedAt);
  void refreshState();
}, 1000);
