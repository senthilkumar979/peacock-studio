import { describe, expect, it, vi } from 'vitest';
import { initInputCapture } from './index';
import type { InputCaptureDeps } from './types';

describe('initInputCapture', () => {
  it('registers listeners and exposes flushAllPending', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const deps: InputCaptureDeps = {
      isRecordingActive: () => false,
      storeEvent: vi.fn(async () => undefined),
      captureScreenshotId: vi.fn(async () => ''),
      isPeacockUi: () => false,
    };

    const api = initInputCapture(deps);
    expect(typeof api.flushAllPending).toBe('function');
    await expect(api.flushAllPending()).resolves.toBeUndefined();

    const types = addSpy.mock.calls.map((call) => call[0]);
    expect(types).toEqual(
      expect.arrayContaining([
        'input',
        'change',
        'focusin',
        'focusout',
        'compositionstart',
        'compositionend',
        'pagehide',
        'keydown',
      ]),
    );
    addSpy.mockRestore();
  });
});
