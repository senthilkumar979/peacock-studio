import type { FlowPayload, FlowStep } from '@peacock/shared';

export interface HandoffResponse {
  payload: FlowPayload | null;
  screenshotUrls?: Record<string, string>;
}

export type AppExtensionMessage =
  | { type: 'APP_READY' }
  | { type: 'GET_PENDING_HANDOFF' };

export type AppExtensionResponse = HandoffResponse;
