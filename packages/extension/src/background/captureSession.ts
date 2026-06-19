import type { FlowCaptureEnvironment } from '@peacock/shared';

const CAPTURE_SESSION_KEY = 'peacockCaptureSession';
const FINAL_CAPTURE_ENV_KEY = 'peacockFinalCaptureEnvironment';

export interface StoredCaptureSession {
  recordingStartedAt: number;
  environment: FlowCaptureEnvironment;
}

export async function saveCaptureSession(session: StoredCaptureSession): Promise<void> {
  await chrome.storage.session.set({ [CAPTURE_SESSION_KEY]: session });
}

export async function getCaptureSession(): Promise<StoredCaptureSession | null> {
  const stored = await chrome.storage.session.get(CAPTURE_SESSION_KEY);
  return (stored[CAPTURE_SESSION_KEY] as StoredCaptureSession | undefined) ?? null;
}

export async function saveFinalCaptureEnvironment(
  environment: FlowCaptureEnvironment,
): Promise<void> {
  await chrome.storage.session.set({ [FINAL_CAPTURE_ENV_KEY]: environment });
}

export async function getFinalCaptureEnvironment(): Promise<FlowCaptureEnvironment | null> {
  const stored = await chrome.storage.session.get(FINAL_CAPTURE_ENV_KEY);
  return (stored[FINAL_CAPTURE_ENV_KEY] as FlowCaptureEnvironment | undefined) ?? null;
}

export async function clearCaptureSession(): Promise<void> {
  await chrome.storage.session.remove([CAPTURE_SESSION_KEY, FINAL_CAPTURE_ENV_KEY]);
}

export async function finalizeCaptureSession(
  recordingEndedAt: number,
): Promise<FlowCaptureEnvironment | null> {
  const session = await getCaptureSession();
  if (!session) return null;

  const durationMs = Math.max(0, recordingEndedAt - session.recordingStartedAt);

  return {
    ...session.environment,
    recordingStartedAt: session.recordingStartedAt,
    recordingEndedAt,
    durationMs,
  };
}
