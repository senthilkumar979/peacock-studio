import type { Viewport } from '../types/events';

/** Neutral placeholder shown for manually added steps until a screenshot is uploaded. */
export const MANUAL_STEP_PLACEHOLDER_SCREENSHOT =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">' +
      '<rect fill="#f1f5f9" width="1280" height="720"/>' +
      '<text x="640" y="340" text-anchor="middle" fill="#64748b" font-family="system-ui,sans-serif" font-size="22">' +
      'Upload a screenshot for this step</text>' +
      '<text x="640" y="380" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="16">' +
      'Use the panel on the right</text></svg>'
  );

export const DEFAULT_MANUAL_VIEWPORT: Viewport = {
  width: 1280,
  height: 720,
  scrollX: 0,
  scrollY: 0,
  dpr: 1,
};
