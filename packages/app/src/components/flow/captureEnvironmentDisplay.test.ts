import { describe, expect, it } from 'vitest';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import { buildCaptureDetailGroups, buildCaptureHighlights } from './captureEnvironmentDisplay';

const environment: FlowCaptureEnvironment = {
  userAgent: 'Mozilla/5.0',
  locale: 'en-US',
  languages: ['en-US'],
  timezone: 'UTC',
  platform: 'MacIntel',
  os: { family: 'macos', name: 'macOS', version: '15.0' },
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
  recordingEndedAt: 2_000,
  durationMs: 1_999,
};

describe('captureEnvironmentDisplay', () => {
  it('builds OS, browser, and duration highlights', () => {
    const highlights = buildCaptureHighlights(environment);
    expect(highlights.map((h) => h.id)).toEqual(['os', 'browser', 'duration']);
    expect(highlights[0]).toMatchObject({
      label: 'Operating system',
      value: 'macOS',
      detail: '15.0',
    });
    expect(highlights[1]).toMatchObject({
      label: 'Browser',
      value: 'Chrome',
      detail: '120',
    });
    expect(highlights[2]?.label).toBe('Capture time');
    expect(highlights[2]?.value.length).toBeGreaterThan(0);
  });

  it('omits version detail when null and formats detail groups', () => {
    const withoutVersions: FlowCaptureEnvironment = {
      ...environment,
      os: { ...environment.os, version: null },
      browser: { ...environment.browser, version: null },
    };

    const highlights = buildCaptureHighlights(withoutVersions);
    expect(highlights[0]?.detail).toBeUndefined();
    expect(highlights[1]?.detail).toBeUndefined();

    const groups = buildCaptureDetailGroups(withoutVersions);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.title).toBe('System details');
    expect(groups[0]?.items).toEqual(
      expect.arrayContaining([
        { label: 'OS', value: 'macOS' },
        { label: 'Browser', value: 'Chrome' },
        { label: 'Locale', value: 'en-US' },
        { label: 'Viewport', value: '1280 × 800' },
      ]),
    );
  });

  it('includes versions in detail group values when present', () => {
    const groups = buildCaptureDetailGroups(environment);
    expect(groups[0]?.items.find((i) => i.label === 'OS')?.value).toBe('macOS 15.0');
    expect(groups[0]?.items.find((i) => i.label === 'Browser')?.value).toBe('Chrome 120');
  });
});
