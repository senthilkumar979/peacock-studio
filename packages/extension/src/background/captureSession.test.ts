import { describe, expect, it } from 'vitest';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import {
  clearCaptureSession,
  finalizeCaptureSession,
  getCaptureSession,
  getFinalCaptureEnvironment,
  saveCaptureSession,
  saveFinalCaptureEnvironment,
} from './captureSession';

function makeEnv(overrides: Partial<FlowCaptureEnvironment> = {}): FlowCaptureEnvironment {
  return {
    userAgent: 'ua',
    locale: 'en',
    languages: ['en'],
    timezone: 'UTC',
    platform: 'MacIntel',
    os: { family: 'macos', name: 'macOS', version: null },
    browser: { family: 'chrome', name: 'Chrome', version: null },
    device: { category: 'desktop', type: 'desktop' },
    screen: {
      width: 100,
      height: 100,
      availWidth: 100,
      availHeight: 100,
      devicePixelRatio: 1,
    },
    viewport: { width: 80, height: 60 },
    recordingStartedAt: 1000,
    recordingEndedAt: 1000,
    durationMs: 0,
    ...overrides,
  };
}

describe('captureSession', () => {
  it('saves and loads a capture session', async () => {
    const session = {
      recordingStartedAt: 1000,
      environment: makeEnv(),
    };
    await saveCaptureSession(session);
    expect(await getCaptureSession()).toEqual(session);
  });

  it('saves and loads final capture environment', async () => {
    const env = makeEnv({ durationMs: 50 });
    await saveFinalCaptureEnvironment(env);
    expect(await getFinalCaptureEnvironment()).toEqual(env);
  });

  it('clears both session keys', async () => {
    await saveCaptureSession({
      recordingStartedAt: 1,
      environment: makeEnv(),
    });
    await saveFinalCaptureEnvironment(makeEnv());
    await clearCaptureSession();
    expect(await getCaptureSession()).toBeNull();
    expect(await getFinalCaptureEnvironment()).toBeNull();
  });

  it('finalizes duration from recording end time', async () => {
    await saveCaptureSession({
      recordingStartedAt: 1000,
      environment: makeEnv({ recordingStartedAt: 1000 }),
    });

    const finalized = await finalizeCaptureSession(1500);
    expect(finalized?.durationMs).toBe(500);
    expect(finalized?.recordingEndedAt).toBe(1500);
  });

  it('clamps negative duration to zero', async () => {
    await saveCaptureSession({
      recordingStartedAt: 2000,
      environment: makeEnv({ recordingStartedAt: 2000 }),
    });
    const finalized = await finalizeCaptureSession(1000);
    expect(finalized?.durationMs).toBe(0);
  });

  it('returns null when finalizing without a session', async () => {
    expect(await finalizeCaptureSession(Date.now())).toBeNull();
  });
});
