import type { FlowCaptureEnvironment } from '../types/captureEnvironment';
import { buildCaptureEnvironment } from './parseCaptureEnvironment';

export function collectCaptureEnvironmentFromWindow(
  recordingStartedAt: number,
  recordingEndedAt: number = recordingStartedAt,
): FlowCaptureEnvironment {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  return buildCaptureEnvironment({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages.length ? navigator.languages : [navigator.language],
    timezone,
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    devicePixelRatio: window.devicePixelRatio || 1,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    recordingStartedAt,
    recordingEndedAt,
  });
}
