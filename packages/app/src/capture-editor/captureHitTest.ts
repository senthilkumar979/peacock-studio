import type { CaptureEditorSettings } from '@peacock/shared';

function pointInRect(
  x: number,
  y: number,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

export function hitTestCaptureSelection(
  normalizedX: number,
  normalizedY: number,
  settings: CaptureEditorSettings,
): string | null {
  for (let i = settings.privacyRegions.length - 1; i >= 0; i -= 1) {
    const item = settings.privacyRegions[i];
    if (!item) continue;
    if (pointInRect(normalizedX, normalizedY, item.rect)) return item.id;
  }

  return null;
}
