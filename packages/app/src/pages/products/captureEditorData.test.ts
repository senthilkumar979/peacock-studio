import { describe, expect, it } from 'vitest';
import {
  CAPTURE_EDITOR_PAGE,
  CAPTURE_EDITOR_WORKFLOW,
  getCaptureEditorImageSrc,
  MANUAL_SCREENSHOT_PAIN_POINTS,
} from './captureEditorData';

describe('captureEditorData', () => {
  it('exports page copy, pain points, and workflow', () => {
    expect(CAPTURE_EDITOR_PAGE.intro.length).toBeGreaterThan(20);
    expect(MANUAL_SCREENSHOT_PAIN_POINTS.length).toBeGreaterThan(0);
    expect(CAPTURE_EDITOR_WORKFLOW.length).toBeGreaterThan(0);
    expect(getCaptureEditorImageSrc('hero.png')).toContain('capture-screenshot-editor');
  });
});
