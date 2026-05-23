import type { RecordingStateSnapshot, RecordingStatus } from '@peacock/shared';

const SESSION_KEY = 'peacockRecordingState';

interface StoredRecordingState {
  status: RecordingStatus;
  startedAt: number | null;
}

const defaultState: StoredRecordingState = {
  status: 'idle',
  startedAt: null,
};

export async function getRecordingState(eventCount: number): Promise<RecordingStateSnapshot> {
  const stored = await chrome.storage.session.get(SESSION_KEY);
  const state = (stored[SESSION_KEY] as StoredRecordingState | undefined) ?? defaultState;

  return {
    status: state.status,
    eventCount,
    startedAt: state.startedAt,
  };
}

export async function setRecordingStatus(status: RecordingStatus): Promise<void> {
  const stored = await chrome.storage.session.get(SESSION_KEY);
  const current = (stored[SESSION_KEY] as StoredRecordingState | undefined) ?? defaultState;

  const next: StoredRecordingState = {
    status,
    startedAt: status === 'recording' && !current.startedAt ? Date.now() : current.startedAt,
  };

  if (status === 'idle') {
    next.startedAt = null;
  }

  await chrome.storage.session.set({ [SESSION_KEY]: next });
}

export async function getRecordingStatus(): Promise<RecordingStatus> {
  const stored = await chrome.storage.session.get(SESSION_KEY);
  const state = (stored[SESSION_KEY] as StoredRecordingState | undefined) ?? defaultState;
  return state.status;
}
