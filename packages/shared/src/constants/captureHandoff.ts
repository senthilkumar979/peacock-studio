import type { CaptureResultHandoff, ScreenshotToolMode } from '../types/capture';

export const CAPTURE_HANDOFF_REQUEST = 'PEACOCK_REQUEST_CAPTURE_HANDOFF';
export const CAPTURE_HANDOFF_RESPONSE = 'PEACOCK_CAPTURE_HANDOFF_RESPONSE';

export interface CaptureHandoffRequestMessage {
  type: typeof CAPTURE_HANDOFF_REQUEST;
  captureId: string;
}

export interface CaptureHandoffBridgeMessage {
  type: typeof CAPTURE_HANDOFF_RESPONSE;
  ok: boolean;
  captureId?: string;
  mode?: ScreenshotToolMode;
  imageDataUrl?: string;
  naturalWidth?: number;
  naturalHeight?: number;
  error?: string | null;
}

export function toCaptureResultHandoff(message: CaptureHandoffBridgeMessage): CaptureResultHandoff {
  return {
    ok: message.ok,
    captureId: message.captureId,
    mode: message.mode,
    imageDataUrl: message.imageDataUrl,
    naturalWidth: message.naturalWidth,
    naturalHeight: message.naturalHeight,
    error: message.error ?? undefined,
  };
}
