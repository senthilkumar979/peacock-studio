import type { RecordingStateSnapshot } from '@peacock/shared';
import { sendExtensionMessage } from '../src/messaging/sendExtensionMessage';

const logoEl = document.getElementById('logo') as HTMLImageElement | null;
const pageHostEl = document.getElementById('page-host') as HTMLParagraphElement | null;
const eventCountEl = document.getElementById('event-count') as HTMLParagraphElement | null;
const elapsedEl = document.getElementById('elapsed') as HTMLParagraphElement | null;
const statusEl = document.getElementById('status') as HTMLParagraphElement | null;
const statusDetailEl = document.getElementById('status-detail') as HTMLParagraphElement | null;
const statusBadgeEl = document.getElementById('status-badge') as HTMLDivElement | null;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement | null;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement | null;
const resumeBtn = document.getElementById('resume-btn') as HTMLButtonElement | null;
const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement | null;
const screenshotModeEl = document.getElementById('screenshot-mode') as HTMLSelectElement | null;
const openDashboardBtn = document.getElementById('open-dashboard-btn') as HTMLButtonElement | null;
const openEditorBtn = document.getElementById('open-editor-btn') as HTMLButtonElement | null;

if (logoEl) logoEl.src = chrome.runtime.getURL('logo.png');

let lastState: RecordingStateSnapshot | null = null;
let isBusy = false;

type ScreenshotMode = 'full-page' | 'selection' | 'visible';

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
  if (startBtn) startBtn.disabled = disabled;
  if (pauseBtn) pauseBtn.disabled = disabled;
  if (resumeBtn) resumeBtn.disabled = disabled;
  if (stopBtn) stopBtn.disabled = disabled;
  if (screenshotModeEl) screenshotModeEl.disabled = disabled;
}

function renderState(state: RecordingStateSnapshot): void {
  lastState = state;
  if (eventCountEl) eventCountEl.textContent = String(state.eventCount);
  if (elapsedEl) elapsedEl.textContent = formatElapsed(state.startedAt);

  if (startBtn) startBtn.hidden = state.status !== 'idle';
  if (pauseBtn) pauseBtn.hidden = state.status !== 'recording';
  if (resumeBtn) resumeBtn.hidden = state.status !== 'paused';
  if (stopBtn) stopBtn.hidden = state.status === 'idle';
  setButtonsDisabled(isBusy);

  if (statusBadgeEl) {
    statusBadgeEl.className = `status-badge status-badge--${state.status}`;
  }

  if (state.status === 'recording') {
    if (statusBadgeEl) statusBadgeEl.textContent = 'Recording';
    setPopupFeedback(
      'Recording actions on the current tab.',
      'Clicks, inputs, navigation, and screenshots are being captured live.'
    );
    return;
  }

  if (state.status === 'paused') {
    if (statusBadgeEl) statusBadgeEl.textContent = 'Paused';
    setPopupFeedback('Recording is paused.', 'Resume when you are ready to continue the same flow.');
    return;
  }

  if (statusBadgeEl) statusBadgeEl.textContent = 'Idle';
  setPopupFeedback(
    'Ready to record this tab.',
    'Start recording without refreshing the page, then stop to open the editor.'
  );
}

async function refreshState(): Promise<void> {
  try {
    const [state, pageLabel] = await Promise.all([
      sendExtensionMessage<RecordingStateSnapshot>({ type: 'GET_RECORDING_STATE' }),
      getCurrentPageLabel(),
    ]);
    if (pageHostEl) pageHostEl.textContent = pageLabel;
    renderState(state);
  } catch (error) {
    setPopupFeedback(
      'Could not load extension state.',
      error instanceof Error ? error.message : 'Try reopening the popup.'
    );
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

function setPopupFeedback(title: string, detail: string): void {
  if (statusEl) statusEl.textContent = title;
  if (statusDetailEl) statusDetailEl.textContent = detail;
}

async function runScreenshotTool(mode: ScreenshotMode): Promise<void> {
  if (screenshotModeEl) screenshotModeEl.value = '';

  if (mode === 'selection') {
    chrome.runtime.sendMessage({ type: 'START_SCREENSHOT_TOOL', mode });
    window.close();
    return;
  }

  isBusy = true;
  setButtonsDisabled(true);
  setPopupFeedback(
    mode === 'full-page' ? 'Capturing the full page…' : 'Capturing the visible area…',
    mode === 'full-page'
      ? 'Keep this popup open while Peacock scrolls and stitches the page.'
      : 'Peacock is saving the current viewport.'
  );

  try {
    await sendExtensionMessage({ type: 'START_SCREENSHOT_TOOL', mode });
    window.close();
  } catch (error) {
    setPopupFeedback(
      'Screenshot capture failed.',
      error instanceof Error ? error.message : 'Please try again on this page.'
    );
  } finally {
    isBusy = false;
    if (lastState) setButtonsDisabled(false);
  }
}

startBtn?.addEventListener('click', () => void runAction('START_RECORDING'));
pauseBtn?.addEventListener('click', () => void runAction('PAUSE_RECORDING'));
resumeBtn?.addEventListener('click', () => void runAction('RESUME_RECORDING'));
stopBtn?.addEventListener('click', () => void runAction('STOP_RECORDING'));
screenshotModeEl?.addEventListener('change', () => {
  const mode = screenshotModeEl.value as ScreenshotMode | '';
  if (!mode) return;
  void runScreenshotTool(mode);
});
openDashboardBtn?.addEventListener('click', () => void openUrl(dashboardUrl));
openEditorBtn?.addEventListener('click', () => void openUrl(editorUrl));

void refreshState();
window.setInterval(() => {
  if (lastState?.startedAt && elapsedEl) {
    elapsedEl.textContent = formatElapsed(lastState.startedAt);
  }
  void refreshState();
}, 1000);
