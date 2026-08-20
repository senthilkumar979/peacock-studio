import { describe, expect, it } from 'vitest';
import {
  buildCaptureEnvironment,
  detectDeviceCategory,
  parseBrowserFamily,
  parseOsFamily,
} from './parseCaptureEnvironment';

describe('parseBrowserFamily', () => {
  it('detects Chrome', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(parseBrowserFamily(ua)).toEqual({
      family: 'chrome',
      name: 'Chrome',
      version: '120.0.0.0',
    });
  });

  it('detects Edge', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    expect(parseBrowserFamily(ua).family).toBe('edge');
  });

  it('detects Firefox', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
    expect(parseBrowserFamily(ua).family).toBe('firefox');
  });
});

describe('parseOsFamily', () => {
  it('detects macOS', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(parseOsFamily(ua, 'MacIntel')).toEqual({
      family: 'macos',
      name: 'macOS',
      version: '10.15.7',
    });
  });

  it('detects Windows', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(parseOsFamily(ua, 'Win32').family).toBe('windows');
  });
});

describe('detectDeviceCategory', () => {
  it('classifies desktop viewports', () => {
    expect(
      detectDeviceCategory(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        { width: 1440, height: 900 },
        0,
      ),
    ).toBe('desktop');
  });

  it('classifies mobile user agents', () => {
    expect(
      detectDeviceCategory(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
        { width: 390, height: 844 },
        5,
      ),
    ).toBe('mobile');
  });

  it('classifies tablets and touch heuristics', () => {
    expect(
      detectDeviceCategory(
        'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
        { width: 1024, height: 768 },
        5,
      ),
    ).toBe('tablet');
    expect(
      detectDeviceCategory(
        'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
        { width: 800, height: 1280 },
        5,
      ),
    ).toBe('tablet');
    expect(
      detectDeviceCategory('Custom UA', { width: 500, height: 700 }, 2),
    ).toBe('mobile');
    expect(
      detectDeviceCategory('Custom UA', { width: 900, height: 1000 }, 2),
    ).toBe('tablet');
    expect(
      detectDeviceCategory('Custom UA', { width: 500, height: 500 }, 0),
    ).toBe('unknown');
  });
});

describe('parseOsFamily extras', () => {
  it('detects linux, chromeos, android, ios, and unknown', () => {
    expect(parseOsFamily('X11; CrOS x86_64', 'Linux x86_64').family).toBe('chromeos');
    expect(parseOsFamily('Linux; Android 14', 'Linux armv8l').family).toBe('android');
    expect(parseOsFamily('iPhone OS 17_0', 'iPhone').family).toBe('ios');
    expect(parseOsFamily('X11; Ubuntu; Linux x86_64', 'Linux x86_64').family).toBe('linux');
    expect(parseOsFamily('UnknownBot/1.0', '').family).toBe('unknown');
  });
});

describe('parseBrowserFamily extras', () => {
  it('detects safari, opera, brave, and unknown', async () => {
    const { getDeviceTypeLabel } = await import('./parseCaptureEnvironment');
    expect(
      parseBrowserFamily(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      ).family,
    ).toBe('safari');
    expect(
      parseBrowserFamily(
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
      ).family,
    ).toBe('opera');
    expect(
      parseBrowserFamily(
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/1.0',
      ).family,
    ).toBe('brave');
    expect(parseBrowserFamily('UnknownBot/1.0').family).toBe('unknown');
    expect(getDeviceTypeLabel('mobile')).toBe('Mobile browser');
    expect(getDeviceTypeLabel('tablet')).toBe('Tablet browser');
    expect(getDeviceTypeLabel('unknown')).toBe('Unknown device');
  });
});

describe('buildCaptureEnvironment', () => {
  it('computes duration from recording timestamps', () => {
    const startedAt = 1_000;
    const endedAt = 65_000;

    const environment = buildCaptureEnvironment({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'MacIntel',
      language: 'en-US',
      languages: ['en-US', 'en'],
      timezone: 'America/Los_Angeles',
      screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1050 },
      viewport: { width: 1440, height: 900 },
      devicePixelRatio: 2,
      maxTouchPoints: 0,
      recordingStartedAt: startedAt,
      recordingEndedAt: endedAt,
    });

    expect(environment.durationMs).toBe(64_000);
    expect(environment.locale).toBe('en-US');
    expect(environment.device.type).toBe('Desktop browser');
  });
});
