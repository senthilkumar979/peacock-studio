import type { CaptureEditorSettings } from '@peacock/shared';

export function cloneCaptureSettings(settings: CaptureEditorSettings): CaptureEditorSettings {
  return {
    ...settings,
    crop: { ...settings.crop },
    privacyRegions: settings.privacyRegions.map((region) => ({
      ...region,
      rect: { ...region.rect },
    })),
  };
}
