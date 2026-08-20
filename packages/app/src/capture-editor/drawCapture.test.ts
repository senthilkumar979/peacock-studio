import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CAPTURE_EDITOR_SETTINGS, type CaptureBackgroundPreset } from '@peacock/shared';
import { drawCaptureBackground } from './drawCaptureBackground';
import { drawCaptureHeader } from './drawCaptureHeader';
import { drawCaptureOverlay } from './drawCaptureOverlay';
import { applyPrivacyRegions } from './applyPrivacyRegions';
import { computeCaptureLayout } from './computeCaptureLayout';
import { paintCaptureComposite } from './paintCaptureComposite';

function createContext(overrides: Record<string, unknown> = {}) {
  const gradient = { addColorStop: vi.fn() };
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arcTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    setLineDash: vi.fn(),
    drawImage: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: String(text).length * 8 })),
    createLinearGradient: vi.fn(() => gradient),
    getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
    setTransform: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
    ...overrides,
  };
}

describe('drawCaptureBackground', () => {
  it('fills solid and gradient backgrounds', () => {
    const solid: CaptureBackgroundPreset = {
      id: 'solid',
      label: 'Solid',
      kind: 'solid',
      solidColor: '#ff0000',
    };
    const gradient: CaptureBackgroundPreset = {
      id: 'grad',
      label: 'Grad',
      kind: 'linear-gradient',
      gradientAngle: 45,
      gradientStops: [
        { offset: 0, color: '#000' },
        { offset: 1, color: '#fff' },
      ],
    };

    const ctx = createContext();
    drawCaptureBackground(ctx as never, 100, 80, solid);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 80);

    const rounded = createContext();
    drawCaptureBackground(rounded as never, 100, 80, gradient, 12);
    expect(rounded.createLinearGradient).toHaveBeenCalled();
    expect(rounded.fill).toHaveBeenCalled();
  });
});

describe('drawCaptureHeader', () => {
  it('skips empty captions and draws title/description', () => {
    const layout = computeCaptureLayout(800, 600, {
      ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
      title: 'Hello',
      description: '<p>World</p>',
      padding: 10,
    });
    const empty = createContext();
    drawCaptureHeader(empty as never, layout, DEFAULT_CAPTURE_EDITOR_SETTINGS);
    expect(empty.fillText).not.toHaveBeenCalled();

    const ctx = createContext();
    drawCaptureHeader(ctx as never, layout, {
      ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
      title: 'Hello world title',
      description: 'A longer description that wraps',
      backgroundPresetId: 'charcoal',
    });
    expect(ctx.fillText).toHaveBeenCalled();
  });
});

describe('drawCaptureOverlay', () => {
  it('draws crop dimming, selection handles, and draft rect', () => {
    const settings = {
      ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
      crop: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
      privacyRegions: [
        {
          id: 'r1',
          mode: 'blur' as const,
          intensity: 8,
          rect: { x: 0.2, y: 0.2, width: 0.3, height: 0.3 },
        },
      ],
    };
    const preview = computeCaptureLayout(400, 300, settings, { cropPreview: true });
    const cropCtx = createContext();
    drawCaptureOverlay(cropCtx as never, preview, settings, null, null, 'crop');
    expect(cropCtx.fillRect).toHaveBeenCalled();

    const layout = computeCaptureLayout(400, 300, settings);
    const selectCtx = createContext();
    drawCaptureOverlay(selectCtx as never, layout, settings, 'r1', null, 'select');
    expect(selectCtx.strokeRect).toHaveBeenCalled();

    const draftCtx = createContext();
    drawCaptureOverlay(
      draftCtx as never,
      layout,
      settings,
      null,
      { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      'blur',
    );
    expect(draftCtx.strokeRect).toHaveBeenCalled();
  });
});

describe('applyPrivacyRegions', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        width: number;
        height: number;
        constructor(width: number, height: number) {
          this.width = width;
          this.height = height;
        }
        getContext() {
          return createContext();
        }
      },
    );
  });

  it('no-ops for empty regions or crop preview', () => {
    const layout = computeCaptureLayout(200, 100, DEFAULT_CAPTURE_EDITOR_SETTINGS);
    const ctx = createContext();
    const image = { naturalWidth: 200, naturalHeight: 100 } as HTMLImageElement;
    applyPrivacyRegions(ctx as never, layout, [], image);
    expect(ctx.save).not.toHaveBeenCalled();

    const preview = computeCaptureLayout(200, 100, DEFAULT_CAPTURE_EDITOR_SETTINGS, {
      cropPreview: true,
    });
    applyPrivacyRegions(
      ctx as never,
      preview,
      [{ id: 'r1', mode: 'redact', intensity: 4, rect: { x: 0, y: 0, width: 0.5, height: 0.5 } }],
      image,
    );
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it('redacts and blurs regions', () => {
    const settings = {
      ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
      privacyRegions: [
        {
          id: 'redact',
          mode: 'redact' as const,
          intensity: 4,
          rect: { x: 0.1, y: 0.1, width: 0.4, height: 0.4 },
        },
        {
          id: 'blur',
          mode: 'blur' as const,
          intensity: 12,
          rect: { x: 0.5, y: 0.5, width: 0.3, height: 0.3 },
        },
      ],
    };
    const layout = computeCaptureLayout(400, 300, settings);
    const ctx = createContext();
    const image = { naturalWidth: 400, naturalHeight: 300 } as HTMLImageElement;
    applyPrivacyRegions(ctx as never, layout, settings.privacyRegions, image);
    expect(ctx.setTransform).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('paintCaptureComposite', () => {
  it('paints screenshot with background and privacy regions', async () => {
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        width: number;
        height: number;
        constructor(width: number, height: number) {
          this.width = width;
          this.height = height;
        }
        getContext() {
          return createContext();
        }
      },
    );

    const ctx = createContext();
    const image = {
      naturalWidth: 200,
      naturalHeight: 100,
    } as HTMLImageElement;

    await paintCaptureComposite(ctx as never, {
      image,
      naturalWidth: 200,
      naturalHeight: 100,
      settings: {
        ...DEFAULT_CAPTURE_EDITOR_SETTINGS,
        title: 'Shot',
        description: 'Desc',
        privacyRegions: [
          {
            id: 'r1',
            mode: 'redact',
            intensity: 4,
            rect: { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
          },
        ],
      },
    });

    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalled();
  });
});
