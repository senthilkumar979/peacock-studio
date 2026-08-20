import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CAPTURE_HANDOFF_REQUEST, CAPTURE_HANDOFF_RESPONSE } from '@peacock/shared';
import { useCaptureSource } from './useCaptureSource';

vi.mock('@/utils/getExtensionId', () => ({
  getConfiguredExtensionIds: vi.fn(() => []),
}));

import { getConfiguredExtensionIds } from '@/utils/getExtensionId';

function mockBridgeResponse(response: Record<string, unknown>) {
  vi.spyOn(window, 'postMessage').mockImplementation((message: unknown) => {
    const data = message as { type?: string };
    if (data?.type !== CAPTURE_HANDOFF_REQUEST) return;
    queueMicrotask(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: CAPTURE_HANDOFF_RESPONSE, ...response },
          origin: window.location.origin,
          source: window,
        }),
      );
    });
  });
}

describe('useCaptureSource', () => {
  beforeEach(() => {
    vi.mocked(getConfiguredExtensionIds).mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.chrome;
  });

  it('errors when capture id is missing', async () => {
    const { result } = renderHook(() => useCaptureSource(undefined));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.source).toBeNull();
    expect(result.current.error).toBe('Missing capture id.');
  });

  it('loads capture from bridge response', async () => {
    mockBridgeResponse({
      ok: true,
      captureId: 'cap-1',
      mode: 'region',
      imageDataUrl: 'data:image/png;base64,abc',
      naturalWidth: 800,
      naturalHeight: 600,
    });

    const { result } = renderHook(() => useCaptureSource('cap-1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.source).toEqual({
      captureId: 'cap-1',
      mode: 'region',
      imageDataUrl: 'data:image/png;base64,abc',
      naturalWidth: 800,
      naturalHeight: 600,
    });
  });

  it('falls back to extension id messaging when bridge returns failure', async () => {
    vi.mocked(getConfiguredExtensionIds).mockReturnValue(['ext-1']);
    mockBridgeResponse({
      ok: false,
      error: 'bridge miss',
    });

    const sendMessage = vi.fn((_id, _msg, cb) => {
      cb({
        ok: true,
        captureId: 'cap-2',
        mode: 'full',
        imageDataUrl: 'data:image/png;base64,xyz',
        naturalWidth: 100,
        naturalHeight: 50,
      });
    });
    Object.defineProperty(window, 'chrome', {
      configurable: true,
      value: { runtime: { sendMessage, lastError: undefined } },
    });

    const { result } = renderHook(() => useCaptureSource('cap-2'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(sendMessage).toHaveBeenCalled();
    expect(result.current.source?.captureId).toBe('cap-2');
    expect(result.current.error).toBeNull();
  });

  it('surfaces error when bridge and extension fail', async () => {
    mockBridgeResponse({
      ok: false,
      error: 'No capture found',
    });

    const { result } = renderHook(() => useCaptureSource('missing'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.source).toBeNull();
    expect(result.current.error).toBe('No capture found');
  });

  it('ignores late results after unmount', async () => {
    mockBridgeResponse({
      ok: true,
      captureId: 'cap-late',
      mode: 'region',
      imageDataUrl: 'data:image/png;base64,abc',
      naturalWidth: 1,
      naturalHeight: 1,
    });

    const { unmount } = renderHook(() => useCaptureSource('cap-late'));
    unmount();

    await act(async () => {
      await Promise.resolve();
    });
  });
});
