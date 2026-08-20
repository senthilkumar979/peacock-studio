import { describe, expect, it } from 'vitest';
import { collectCaptureEnvironmentFromWindow } from './collectCaptureEnvironment';

describe('collectCaptureEnvironmentFromWindow', () => {
  it('builds environment from window/navigator', () => {
    const env = collectCaptureEnvironmentFromWindow(1_000, 2_000);

    expect(env.userAgent).toBe(navigator.userAgent);
    expect(env.platform).toBe(navigator.platform);
    expect(env.locale).toBe(navigator.language);
    expect(env.viewport.width).toBe(window.innerWidth);
    expect(env.viewport.height).toBe(window.innerHeight);
    expect(env.recordingStartedAt).toBe(1_000);
    expect(env.recordingEndedAt).toBe(2_000);
    expect(env.timezone).toBeTruthy();
  });

  it('defaults recordingEndedAt to recordingStartedAt', () => {
    const env = collectCaptureEnvironmentFromWindow(5_000);
    expect(env.recordingStartedAt).toBe(5_000);
    expect(env.recordingEndedAt).toBe(5_000);
  });

  it('falls back when optional browser values are missing', () => {
    const originalLanguages = navigator.languages;
    Object.defineProperty(navigator, 'languages', { configurable: true, value: [] });
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 0 });

    const env = collectCaptureEnvironmentFromWindow(1_000, 2_000);
    expect(env.languages).toEqual([navigator.language]);
    expect(env.screen.devicePixelRatio).toBe(1);

    Object.defineProperty(navigator, 'languages', { configurable: true, value: originalLanguages });
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: window.devicePixelRatio || 1,
    });
  });
});
