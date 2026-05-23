import type { RecordingStateSnapshot } from '@peacock/shared';
import { sendExtensionMessage } from '../src/messaging/sendExtensionMessage';

const logoEl = document.getElementById('logo') as HTMLImageElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

logoEl.src = chrome.runtime.getURL('logo.png');
const eventCountEl = document.getElementById('event-count') as HTMLParagraphElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const resumeBtn = document.getElementById('resume-btn') as HTMLButtonElement;
const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;

function renderState(state: RecordingStateSnapshot): void {
  eventCountEl.textContent = `${state.eventCount} steps captured`;

  startBtn.hidden = state.status !== 'idle';
  pauseBtn.hidden = state.status !== 'recording';
  resumeBtn.hidden = state.status !== 'paused';
  stopBtn.hidden = state.status === 'idle';

  if (state.status === 'idle') {
    statusEl.textContent = 'Idle';
    return;
  }

  if (state.status === 'paused') {
    statusEl.textContent = 'Paused';
    return;
  }

  statusEl.textContent = 'Recording';
}

async function refreshState(): Promise<void> {
  const state = await sendExtensionMessage<RecordingStateSnapshot>({ type: 'GET_RECORDING_STATE' });
  renderState(state);
}

startBtn.addEventListener('click', () => {
  void sendExtensionMessage({ type: 'START_RECORDING' }).then(refreshState);
});

pauseBtn.addEventListener('click', () => {
  void sendExtensionMessage({ type: 'PAUSE_RECORDING' }).then(refreshState);
});

resumeBtn.addEventListener('click', () => {
  void sendExtensionMessage({ type: 'RESUME_RECORDING' }).then(refreshState);
});

stopBtn.addEventListener('click', () => {
  void sendExtensionMessage({ type: 'STOP_RECORDING' }).then(refreshState);
});

void refreshState();

const pollIntervalMs = 1000;
window.setInterval(() => {
  void refreshState();
}, pollIntervalMs);
