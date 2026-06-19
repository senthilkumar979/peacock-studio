import type {
  CaptureBrowserFamily,
  CaptureDeviceCategory,
  CaptureOsFamily,
  FlowCaptureEnvironment,
} from '../types/captureEnvironment';

export interface CaptureEnvironmentInput {
  userAgent: string;
  platform: string;
  language: string;
  languages: readonly string[];
  timezone: string;
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  maxTouchPoints: number;
  recordingStartedAt: number;
  recordingEndedAt: number;
}

function matchVersion(userAgent: string, pattern: RegExp): string | null {
  const match = userAgent.match(pattern);
  return match?.[1] ?? null;
}

export function parseBrowserFamily(userAgent: string): {
  family: CaptureBrowserFamily;
  name: string;
  version: string | null;
} {
  const ua = userAgent;

  if (/Edg\//i.test(ua)) {
    return { family: 'edge', name: 'Microsoft Edge', version: matchVersion(ua, /Edg\/([\d.]+)/i) };
  }
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    return {
      family: 'opera',
      name: 'Opera',
      version: matchVersion(ua, /(?:OPR|Opera)\/([\d.]+)/i),
    };
  }
  if (/Firefox\//i.test(ua)) {
    return { family: 'firefox', name: 'Firefox', version: matchVersion(ua, /Firefox\/([\d.]+)/i) };
  }
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua) && !/OPR\//i.test(ua)) {
    if (/Brave/i.test(ua)) {
      return { family: 'brave', name: 'Brave', version: matchVersion(ua, /Chrome\/([\d.]+)/i) };
    }
    return { family: 'chrome', name: 'Chrome', version: matchVersion(ua, /Chrome\/([\d.]+)/i) };
  }
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    return { family: 'safari', name: 'Safari', version: matchVersion(ua, /Version\/([\d.]+)/i) };
  }

  return { family: 'unknown', name: 'Unknown browser', version: null };
}

export function parseOsFamily(userAgent: string, platform: string): {
  family: CaptureOsFamily;
  name: string;
  version: string | null;
} {
  const ua = userAgent;
  const pf = platform.toLowerCase();

  if (/Windows NT/i.test(ua)) {
    const nt = matchVersion(ua, /Windows NT ([\d.]+)/i);
    const label =
      nt === '10.0' ? 'Windows 10/11' : nt ? `Windows NT ${nt}` : 'Windows';
    return { family: 'windows', name: label, version: nt };
  }
  if (/Mac OS X/i.test(ua) || pf.includes('mac')) {
    const version = matchVersion(ua, /Mac OS X ([\d_]+)/i)?.replace(/_/g, '.') ?? null;
    return { family: 'macos', name: 'macOS', version };
  }
  if (/CrOS/i.test(ua)) {
    return { family: 'chromeos', name: 'ChromeOS', version: matchVersion(ua, /CrOS [\w]+ ([\d.]+)/i) };
  }
  if (/Android/i.test(ua)) {
    return { family: 'android', name: 'Android', version: matchVersion(ua, /Android ([\d.]+)/i) };
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return {
      family: 'ios',
      name: /iPad/i.test(ua) ? 'iPadOS' : 'iOS',
      version: matchVersion(ua, /OS ([\d_]+)/i)?.replace(/_/g, '.') ?? null,
    };
  }
  if (/Linux/i.test(ua) || pf.includes('linux')) {
    return { family: 'linux', name: 'Linux', version: null };
  }

  return { family: 'unknown', name: platform || 'Unknown OS', version: null };
}

export function detectDeviceCategory(
  userAgent: string,
  viewport: { width: number; height: number },
  maxTouchPoints: number,
): CaptureDeviceCategory {
  const ua = userAgent;
  const minSide = Math.min(viewport.width, viewport.height);

  if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return 'tablet';
  }
  if (/Mobi|iPhone|iPod|Android/i.test(ua) && /Mobile/i.test(ua)) {
    return 'mobile';
  }
  if (maxTouchPoints > 0 && minSide < 768) {
    return 'mobile';
  }
  if (maxTouchPoints > 0 && minSide < 1100) {
    return 'tablet';
  }
  if (minSide >= 768) {
    return 'desktop';
  }

  return 'unknown';
}

export function getDeviceTypeLabel(category: CaptureDeviceCategory): string {
  if (category === 'mobile') return 'Mobile browser';
  if (category === 'tablet') return 'Tablet browser';
  if (category === 'desktop') return 'Desktop browser';
  return 'Unknown device';
}

export function buildCaptureEnvironment(input: CaptureEnvironmentInput): FlowCaptureEnvironment {
  const browser = parseBrowserFamily(input.userAgent);
  const os = parseOsFamily(input.userAgent, input.platform);
  const category = detectDeviceCategory(
    input.userAgent,
    input.viewport,
    input.maxTouchPoints,
  );
  const durationMs = Math.max(0, input.recordingEndedAt - input.recordingStartedAt);

  return {
    userAgent: input.userAgent,
    locale: input.language,
    languages: [...input.languages],
    timezone: input.timezone,
    platform: input.platform,
    os,
    browser,
    device: {
      category,
      type: getDeviceTypeLabel(category),
    },
    screen: {
      width: input.screen.width,
      height: input.screen.height,
      availWidth: input.screen.availWidth,
      availHeight: input.screen.availHeight,
      devicePixelRatio: input.devicePixelRatio,
    },
    viewport: {
      width: input.viewport.width,
      height: input.viewport.height,
    },
    recordingStartedAt: input.recordingStartedAt,
    recordingEndedAt: input.recordingEndedAt,
    durationMs,
  };
}
