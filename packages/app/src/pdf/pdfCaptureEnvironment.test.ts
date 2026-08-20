import { describe, expect, it } from 'vitest';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import { hasPdfCaptureEnvironment } from './pdfCaptureEnvironment';

const complete: FlowCaptureEnvironment = {
  userAgent: 'Mozilla/5.0',
  locale: 'en-US',
  languages: ['en-US'],
  timezone: 'UTC',
  platform: 'MacIntel',
  os: { family: 'macos', name: 'macOS', version: '15' },
  browser: { family: 'chrome', name: 'Chrome', version: '120' },
  device: { category: 'desktop', type: 'computer' },
  screen: {
    width: 1440,
    height: 900,
    availWidth: 1440,
    availHeight: 860,
    devicePixelRatio: 2,
  },
  viewport: { width: 1280, height: 800 },
  recordingStartedAt: 1,
  recordingEndedAt: 2,
  durationMs: 1,
};

describe('hasPdfCaptureEnvironment', () => {
  it('returns false for missing or incomplete environments', () => {
    expect(hasPdfCaptureEnvironment(undefined)).toBe(false);
    expect(
      hasPdfCaptureEnvironment({
        ...complete,
        userAgent: '',
      }),
    ).toBe(false);
    expect(
      hasPdfCaptureEnvironment({
        ...complete,
        os: { family: 'macos', name: '', version: '15' },
      }),
    ).toBe(false);
  });

  it('returns true when required fields are present', () => {
    expect(hasPdfCaptureEnvironment(complete)).toBe(true);
  });
});
