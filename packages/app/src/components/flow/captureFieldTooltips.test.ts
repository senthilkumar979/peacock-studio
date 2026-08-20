import { describe, expect, it } from 'vitest';
import { CAPTURE_FIELD_TOOLTIPS, getCaptureFieldTooltip } from './captureFieldTooltips';

describe('captureFieldTooltips', () => {
  it('returns tooltips for known labels', () => {
    expect(getCaptureFieldTooltip('Viewport')).toContain('browser window');
    expect(getCaptureFieldTooltip('Screen size')).toBe(CAPTURE_FIELD_TOOLTIPS['Screen size']);
    expect(getCaptureFieldTooltip('Available area')).toContain('taskbar');
  });

  it('returns undefined for unknown labels', () => {
    expect(getCaptureFieldTooltip('Unknown')).toBeUndefined();
  });
});
