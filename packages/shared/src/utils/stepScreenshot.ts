import type { FlowStep } from '../types/events';

export function getCapturedScreenshotId(step: FlowStep): string {
  if (step.screenshotId) return step.screenshotId;
  if (step.event.type === 'navigation') return '';
  if (step.event.type === 'page-view') return step.event.screenshotId;
  return step.event.screenshotId;
}

export function getStepScreenshotId(step: FlowStep): string {
  if (step.customScreenshotId) return step.customScreenshotId;
  return getCapturedScreenshotId(step);
}

export function hasCustomStepScreenshot(step: FlowStep): boolean {
  return Boolean(step.customScreenshotId);
}

export function getStepScreenshotUrl(
  step: FlowStep,
  screenshotUrls: Record<string, string>
): string | null {
  const id = getStepScreenshotId(step);
  return id ? screenshotUrls[id] ?? null : null;
}
