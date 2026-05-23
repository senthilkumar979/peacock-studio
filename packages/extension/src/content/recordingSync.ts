import type { RecordingStateSnapshot } from '@peacock/shared';
import { sendExtensionMessage } from '../messaging/sendExtensionMessage';

const SESSION_KEY = 'peacockRecordingState';

interface StoredRecordingState {
  status: RecordingStatus;
  startedAt: number | null;
}

type RecordingStatus = RecordingStateSnapshot['status'];

export async function syncRecordingStateFromBackground(): Promise<RecordingStateSnapshot> {
  return sendExtensionMessage<RecordingStateSnapshot>({ type: 'GET_RECORDING_STATE' });
}

export function watchRecordingState(
  onUpdate: (state: RecordingStateSnapshot) => void,
  getCurrent: () => RecordingStateSnapshot
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'session') return;

    const change = changes[SESSION_KEY];
    if (!change?.newValue) return;

    const sessionState = change.newValue as StoredRecordingState;
    const current = getCurrent();

    onUpdate({
      ...current,
      status: sessionState.status,
      startedAt: sessionState.startedAt,
    });
  });
}
