import type { RecordingStateSnapshot } from '@peacock/shared';

export function formatFabCount(eventCount: number): string {
  return String(eventCount);
}

export function formatRecordingStatus(state: RecordingStateSnapshot): string {
  const label = state.status === 'paused' ? 'Paused' : 'Recording';
  return `${label} · ${state.eventCount} steps`;
}

export function formatFabAriaLabel(state: RecordingStateSnapshot): string {
  const label = state.status === 'paused' ? 'Paused' : 'Recording';
  return `${label}: ${state.eventCount} steps captured`;
}
