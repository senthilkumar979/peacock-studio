import type { FlowPayload } from '@peacock/shared';

export const HANDOFF_REQUEST = 'PEACOCK_REQUEST_HANDOFF';
export const HANDOFF_RESPONSE = 'PEACOCK_HANDOFF_RESPONSE';

export interface HandoffBridgeMessage {
  type: typeof HANDOFF_RESPONSE;
  ok: boolean;
  payload: FlowPayload | null;
  screenshotUrls: Record<string, string>;
  error?: string | null;
}

export interface HandoffRequestMessage {
  type: typeof HANDOFF_REQUEST;
}
