import { describe, expect, it } from 'vitest';
import {
  CAPTURE_BACKGROUND_PRESETS,
  captureBackgroundUsesLightHeaderText,
  getCaptureBackgroundPreset,
  getPresetSwatchCss,
} from '../constants/captureBackgrounds';
import {
  CAPTURE_HANDOFF_REQUEST,
  CAPTURE_HANDOFF_RESPONSE,
  toCaptureResultHandoff,
} from '../constants/captureHandoff';
import {
  EXTENSION_PING_REQUEST,
  EXTENSION_PING_RESPONSE,
} from '../constants/extensionPing';
import { HANDOFF_REQUEST, HANDOFF_RESPONSE } from '../constants/handoff';
import {
  MAX_IMAGE_BYTES,
  MAX_INNER_TEXT_LENGTH,
} from '../constants/limits';
import {
  DEFAULT_MANUAL_VIEWPORT,
  MANUAL_STEP_PLACEHOLDER_SCREENSHOT,
} from '../constants/manualStep';
import { ENABLE_VALUE_MASKING } from '../constants/privacy';

describe('constants exports', () => {
  it('exposes handoff and ping message types', () => {
    expect(HANDOFF_REQUEST).toBe('PEACOCK_REQUEST_HANDOFF');
    expect(HANDOFF_RESPONSE).toBe('PEACOCK_HANDOFF_RESPONSE');
    expect(EXTENSION_PING_REQUEST).toBe('PEACOCK_EXTENSION_PING');
    expect(EXTENSION_PING_RESPONSE).toBe('PEACOCK_EXTENSION_PONG');
    expect(CAPTURE_HANDOFF_REQUEST).toBe('PEACOCK_REQUEST_CAPTURE_HANDOFF');
    expect(CAPTURE_HANDOFF_RESPONSE).toBe('PEACOCK_CAPTURE_HANDOFF_RESPONSE');
  });

  it('exposes limits, privacy, and manual step constants', () => {
    expect(MAX_INNER_TEXT_LENGTH).toBe(200);
    expect(MAX_IMAGE_BYTES).toBe(1 * 1024 * 1024);
    expect(ENABLE_VALUE_MASKING).toBe(false);
    expect(MANUAL_STEP_PLACEHOLDER_SCREENSHOT.startsWith('data:image/svg+xml')).toBe(true);
    expect(DEFAULT_MANUAL_VIEWPORT).toEqual({
      width: 1280,
      height: 720,
      scrollX: 0,
      scrollY: 0,
      dpr: 1,
    });
  });

  it('maps capture handoff messages to result payloads', () => {
    expect(
      toCaptureResultHandoff({
        type: CAPTURE_HANDOFF_RESPONSE,
        ok: true,
        captureId: 'c1',
        mode: 'visible',
        imageDataUrl: 'data:image/png;base64,abc',
        naturalWidth: 10,
        naturalHeight: 20,
        error: null,
      }),
    ).toEqual({
      ok: true,
      captureId: 'c1',
      mode: 'visible',
      imageDataUrl: 'data:image/png;base64,abc',
      naturalWidth: 10,
      naturalHeight: 20,
      error: undefined,
    });
  });
});

describe('capture backgrounds', () => {
  it('looks up presets and light header usage', () => {
    expect(CAPTURE_BACKGROUND_PRESETS.length).toBeGreaterThan(0);
    expect(getCaptureBackgroundPreset('missing')).toBeNull();
    expect(getCaptureBackgroundPreset('charcoal')?.id).toBe('charcoal');
    expect(captureBackgroundUsesLightHeaderText('charcoal')).toBe(true);
    expect(captureBackgroundUsesLightHeaderText('peacock-soft')).toBe(false);
    expect(captureBackgroundUsesLightHeaderText('missing')).toBe(false);
  });

  it('builds solid and gradient swatch css', () => {
    const solid = getCaptureBackgroundPreset('charcoal')!;
    expect(getPresetSwatchCss(solid)).toBe('#1e293b');

    const gradient = getCaptureBackgroundPreset('ocean')!;
    expect(getPresetSwatchCss(gradient)).toContain('linear-gradient');
    expect(getPresetSwatchCss(gradient)).toContain('#0ea5e9');
  });

  it('defaults gradient angle and empty stops', () => {
    expect(
      getPresetSwatchCss({
        id: 'custom',
        label: 'Custom',
        kind: 'linear-gradient',
      }),
    ).toBe('linear-gradient(135deg, )');
  });
});
