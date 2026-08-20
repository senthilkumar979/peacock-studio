import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CAPTURE_EDITOR_SETTINGS } from '@peacock/shared';
import { roundRectPath } from './canvasRoundRect';
import { computeCanvasDisplayScale } from './computeCanvasDisplayScale';
import { cloneCaptureSettings } from './cloneCaptureSettings';
import { hitTestCaptureSelection } from './captureHitTest';
import { getGradientVector } from './gradientVector';
import {
  computeCaptureHeaderHeight,
  getCaptureHeaderTypography,
} from './captureHeaderTypography';
import {
  canvasPointToCroppedNormalized,
  canvasPointToNormalized,
  canvasPointToSourceNormalized,
  computeCaptureLayout,
  getEffectiveCrop,
  normalizeRectFromPoints,
  normalizedToCanvasRect,
  sourceNormalizedToCanvasRect,
} from './computeCaptureLayout';
import {
  getPrivacyRegionHandleCursor,
  getPrivacyRegionHandlePositions,
  hitTestPrivacyRegionHandle,
  resizeNormalizedRect,
} from './privacyRegionHandles';

function mockPaintContext() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arcTo: vi.fn(),
    closePath: vi.fn(),
  };
}

describe('canvasRoundRect', () => {
  it('builds a rounded path clamped to half edges', () => {
    const context = mockPaintContext();
    roundRectPath(context as never, 10, 20, 100, 40, 999);
    expect(context.beginPath).toHaveBeenCalled();
    expect(context.moveTo).toHaveBeenCalledWith(30, 20);
    expect(context.arcTo).toHaveBeenCalledTimes(4);
    expect(context.closePath).toHaveBeenCalled();
  });

  it('allows zero radius', () => {
    const context = mockPaintContext();
    roundRectPath(context as never, 0, 0, 10, 10, 0);
    expect(context.moveTo).toHaveBeenCalledWith(0, 0);
  });
});

describe('computeCanvasDisplayScale', () => {
  it('fits within container and applies devicePixelRatio', () => {
    const original = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
    const scale = computeCanvasDisplayScale(1000, 500, 500, 400);
    expect(scale.fitScale).toBe(0.5);
    expect(scale.bitmapScale).toBe(1);
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: original });
  });

  it('caps huge bitmaps', () => {
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 10 });
    const scale = computeCanvasDisplayScale(2000, 2000, 2000, 2000);
    expect(scale.bitmapScale).toBeLessThanOrEqual(8192 / 2000);
  });
});

describe('cloneCaptureSettings', () => {
  it('deep-clones crop and privacy regions', () => {
    const settings = {
      ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
      privacyRegions: [
        { id: 'r1', mode: 'blur' as const, intensity: 8, rect: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 } },
      ],
    };
    const clone = cloneCaptureSettings(settings);
    clone.crop.x = 0.5;
    clone.privacyRegions[0]!.rect.width = 0.9;
    expect(settings.crop.x).toBe(0);
    expect(settings.privacyRegions[0]!.rect.width).toBe(0.3);
  });
});

describe('captureHitTest', () => {
  it('returns topmost region id or null', () => {
    const settings = {
      ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
      privacyRegions: [
        { id: 'a', mode: 'redact' as const, intensity: 4, rect: { x: 0, y: 0, width: 0.5, height: 0.5 } },
        { id: 'b', mode: 'blur' as const, intensity: 8, rect: { x: 0.2, y: 0.2, width: 0.5, height: 0.5 } },
      ],
    };
    expect(hitTestCaptureSelection(0.3, 0.3, settings)).toBe('b');
    expect(hitTestCaptureSelection(0.05, 0.05, settings)).toBe('a');
    expect(hitTestCaptureSelection(0.9, 0.9, settings)).toBeNull();
  });
});

describe('gradientVector', () => {
  it('returns opposing points through the center', () => {
    const vector = getGradientVector(90, 100, 50);
    expect(vector.x0 + vector.x1).toBeCloseTo(100);
    expect(vector.y0 + vector.y1).toBeCloseTo(50);
  });
});

describe('captureHeaderTypography', () => {
  it('clamps type sizes for narrow and wide content', () => {
    const narrow = getCaptureHeaderTypography(100);
    const wide = getCaptureHeaderTypography(5000);
    expect(narrow.titleSize).toBe(28);
    expect(wide.titleSize).toBe(72);
    expect(narrow.titleFont).toContain('28px');
  });

  it('computes header height for title and description', () => {
    expect(computeCaptureHeaderHeight('', '', 800)).toBe(0);
    expect(computeCaptureHeaderHeight('Title', '', 800)).toBeGreaterThan(0);
    expect(computeCaptureHeaderHeight('Title', '<p>Desc</p>', 800)).toBeGreaterThan(
      computeCaptureHeaderHeight('Title', '', 800),
    );
    expect(computeCaptureHeaderHeight('', 'Only desc', 800)).toBeGreaterThan(0);
    expect(
      computeCaptureHeaderHeight('A'.repeat(200), 'B'.repeat(200), 200),
    ).toBeGreaterThan(100);
  });
});

describe('computeCaptureLayout', () => {
  const settings = {
    ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
    padding: 20,
    title: 'Caption',
    description: 'Notes',
    crop: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
  };

  it('clamps crop and builds export layout', () => {
    expect(getEffectiveCrop({ x: -1, y: 2, width: 3, height: 0 })).toEqual({
      x: 0,
      y: 1,
      width: 1,
      height: 0.02,
    });
    const layout = computeCaptureLayout(1000, 800, settings);
    expect(layout.isCropPreview).toBe(false);
    expect(layout.imageWidth).toBe(500);
    expect(layout.imageHeight).toBe(400);
    expect(layout.imageLeft).toBe(20);
    expect(layout.headerHeight).toBeGreaterThan(0);
    expect(layout.canvasWidth).toBe(540);
  });

  it('uses full source size in crop preview', () => {
    const layout = computeCaptureLayout(1000, 800, settings, { cropPreview: true });
    expect(layout.isCropPreview).toBe(true);
    expect(layout.imageWidth).toBe(1000);
    expect(layout.imageHeight).toBe(800);
  });

  it('maps rects and points between spaces', () => {
    const layout = computeCaptureLayout(1000, 800, settings);
    expect(sourceNormalizedToCanvasRect({ x: 0, y: 0, width: 1, height: 1 }, layout)).toEqual({
      x: layout.imageLeft,
      y: layout.imageTop,
      width: layout.imageWidth,
      height: layout.imageHeight,
    });
    expect(normalizedToCanvasRect({ x: 0.5, y: 0.5, width: 0.25, height: 0.25 }, layout)).toEqual({
      x: layout.imageLeft + 0.5 * layout.imageWidth,
      y: layout.imageTop + 0.5 * layout.imageHeight,
      width: 0.25 * layout.imageWidth,
      height: 0.25 * layout.imageHeight,
    });

    const preview = computeCaptureLayout(1000, 800, settings, { cropPreview: true });
    expect(normalizedToCanvasRect({ x: 0, y: 0, width: 1, height: 1 }, preview).width).toBe(
      preview.imageWidth,
    );

    expect(canvasPointToNormalized(layout.imageLeft, layout.imageTop, layout)).toEqual({
      x: 0,
      y: 0,
    });
    expect(canvasPointToNormalized(0, 0, layout)).toBeNull();
    expect(canvasPointToCroppedNormalized(layout.imageLeft, layout.imageTop, layout)).toEqual({
      x: 0,
      y: 0,
    });
    expect(canvasPointToCroppedNormalized(preview.imageLeft, preview.imageTop, preview)).toBeNull();
    expect(canvasPointToSourceNormalized(preview.imageLeft, preview.imageTop, preview)).toEqual({
      x: 0,
      y: 0,
    });
    expect(canvasPointToSourceNormalized(layout.imageLeft, layout.imageTop, layout)).toBeNull();
  });

  it('normalizes rects from pointer points', () => {
    expect(normalizeRectFromPoints(0.8, 0.8, 0.2, 0.2)).toMatchObject({
      x: 0.2,
      y: 0.2,
    });
    expect(normalizeRectFromPoints(0.8, 0.8, 0.2, 0.2).width).toBeCloseTo(0.6, 5);
    expect(normalizeRectFromPoints(0.8, 0.8, 0.2, 0.2).height).toBeCloseTo(0.6, 5);
    expect(normalizeRectFromPoints(0.5, 0.5, 0.501, 0.501).width).toBe(0.02);
  });
});

describe('privacyRegionHandles', () => {
  const rect = { x: 10, y: 20, width: 100, height: 80 };

  it('returns handle positions and cursors', () => {
    const positions = getPrivacyRegionHandlePositions(rect);
    expect(positions.nw).toEqual({ x: 10, y: 20 });
    expect(positions.se).toEqual({ x: 110, y: 100 });
    expect(positions.n).toEqual({ x: 60, y: 20 });
    expect(getPrivacyRegionHandleCursor('nw')).toBe('nwse-resize');
    expect(getPrivacyRegionHandleCursor('e')).toBe('ew-resize');
  });

  it('hit-tests handles within radius', () => {
    expect(hitTestPrivacyRegionHandle(10, 20, rect)).toBe('nw');
    expect(hitTestPrivacyRegionHandle(60, 20, rect)).toBe('n');
    expect(hitTestPrivacyRegionHandle(0, 0, rect)).toBeNull();
  });

  it('resizes normalized rects for every handle', () => {
    const origin = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
    expect(resizeNormalizedRect(origin, 'nw', 0.1, 0.1).x).toBeCloseTo(0.1);
    expect(resizeNormalizedRect(origin, 'n', 0.3, 0.1).y).toBeCloseTo(0.1);
    expect(resizeNormalizedRect(origin, 'ne', 0.8, 0.1).width).toBeCloseTo(0.6);
    expect(resizeNormalizedRect(origin, 'e', 0.9, 0.4).width).toBeCloseTo(0.7);
    expect(resizeNormalizedRect(origin, 'se', 0.9, 0.9).height).toBeCloseTo(0.7);
    expect(resizeNormalizedRect(origin, 's', 0.4, 0.9).height).toBeCloseTo(0.7);
    expect(resizeNormalizedRect(origin, 'sw', 0.05, 0.9).x).toBeCloseTo(0.05);
    expect(resizeNormalizedRect(origin, 'w', 0.05, 0.4).x).toBeCloseTo(0.05);
    const swapped = resizeNormalizedRect(origin, 'se', 0.1, 0.1);
    expect(swapped.width).toBeGreaterThanOrEqual(0.02);
    expect(swapped.height).toBeGreaterThanOrEqual(0.02);
  });
});
