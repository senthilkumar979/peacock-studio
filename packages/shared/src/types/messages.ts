import type { FlowPayload } from './events';

export type RecordingStatus = 'idle' | 'recording' | 'paused';

export interface RecordingStateSnapshot {
  status: RecordingStatus;
  eventCount: number;
  startedAt: number | null;
}

export type ExtensionMessage =
  | { type: 'CAPTURE_SCREENSHOT'; tabId?: number }
  | { type: 'CAPTURE_PAGE_SNAPSHOT' }
  | { type: 'CAPTURE_FINAL_PAGE' }
  | { type: 'STORE_EVENT'; event: import('./events').FlowEvent }
  | { type: 'START_RECORDING' }
  | { type: 'PAUSE_RECORDING' }
  | { type: 'RESUME_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'GET_RECORDING_STATE' }
  | { type: 'RECORDING_STATE'; state: RecordingStateSnapshot }
  | { type: 'APP_READY'; tabId?: number }
  | { type: 'GET_PENDING_HANDOFF' }
  | { type: 'CONTENT_SCRIPT_READY'; url: string }
  | { type: 'PING' }
  | { type: 'RECORDING_STARTED' }
  | { type: 'INJECT_PAYLOAD'; payload: FlowPayload; screenshotUrls: Record<string, string> };

export type ExtensionResponse =
  | { screenshotId: string }
  | RecordingStateSnapshot
  | { success: true }
  | { payload: FlowPayload | null; screenshotUrls?: Record<string, string> };
