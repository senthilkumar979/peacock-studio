export type ScreenshotToolMode = 'full-page' | 'visible' | 'selection';

export type CaptureEditorTool = 'select' | 'crop' | 'blur' | 'redact';

export type CapturePrivacyMode = 'blur' | 'redact';

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureGradientStop {
  offset: number;
  color: string;
}

export interface CaptureBackgroundPreset {
  id: string;
  label: string;
  kind: 'solid' | 'linear-gradient';
  solidColor?: string;
  gradientAngle?: number;
  gradientStops?: CaptureGradientStop[];
  imageShadow?: boolean;
  /** Render caption title and description in light colors on dark backgrounds. */
  lightHeaderText?: boolean;
}

export interface CapturePrivacyRegion {
  id: string;
  rect: NormalizedRect;
  mode: CapturePrivacyMode;
  /** Blur strength (4–24). Unused for redact. */
  intensity: number;
}

export interface CaptureEditorSettings {
  backgroundPresetId: string;
  padding: number;
  cornerRadius: number;
  /** Rounded corners for the gradient frame (exported with transparency outside). */
  frameCornerRadius: number;
  crop: NormalizedRect;
  privacyRegions: CapturePrivacyRegion[];
  /** Optional caption above the screenshot (outside the image). */
  title: string;
  description: string;
}

export const DEFAULT_CAPTURE_CROP: NormalizedRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

export const DEFAULT_CAPTURE_EDITOR_SETTINGS: CaptureEditorSettings = {
  backgroundPresetId: 'rose-gold',
  padding: 60,
  cornerRadius: 48,
  frameCornerRadius: 32,
  crop: { ...DEFAULT_CAPTURE_CROP },
  privacyRegions: [],
  title: '',
  description: '',
};

/** Flow-doc editor defaults: no marketing frame until the user opts in. */
export const FLOW_STEP_CAPTURE_EDITOR_SETTINGS: CaptureEditorSettings = {
  backgroundPresetId: 'none',
  padding: 0,
  cornerRadius: 0,
  frameCornerRadius: 0,
  crop: { ...DEFAULT_CAPTURE_CROP },
  privacyRegions: [],
  title: '',
  description: '',
};

export interface FlowStepScreenshotEdit {
  sourceScreenshotId: string;
  sourceWidth: number;
  sourceHeight: number;
  settings: CaptureEditorSettings;
}

export interface CaptureResultHandoff {
  ok: boolean;
  captureId?: string;
  mode?: ScreenshotToolMode;
  imageDataUrl?: string;
  naturalWidth?: number;
  naturalHeight?: number;
  error?: string;
}
