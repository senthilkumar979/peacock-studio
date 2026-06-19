export type CaptureOsFamily =
  | 'windows'
  | 'macos'
  | 'linux'
  | 'chromeos'
  | 'android'
  | 'ios'
  | 'unknown';

export type CaptureBrowserFamily =
  | 'chrome'
  | 'edge'
  | 'firefox'
  | 'safari'
  | 'opera'
  | 'brave'
  | 'unknown';

export type CaptureDeviceCategory = 'desktop' | 'tablet' | 'mobile' | 'unknown';

export interface FlowCaptureEnvironment {
  userAgent: string;
  locale: string;
  languages: string[];
  timezone: string;
  platform: string;
  os: {
    family: CaptureOsFamily;
    name: string;
    version: string | null;
  };
  browser: {
    family: CaptureBrowserFamily;
    name: string;
    version: string | null;
  };
  device: {
    category: CaptureDeviceCategory;
    type: string;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    devicePixelRatio: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  recordingStartedAt: number;
  recordingEndedAt: number;
  durationMs: number;
}
