import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HANDOFF_REQUEST, HANDOFF_RESPONSE, type FlowPayload } from '@peacock/shared';
import { useFlowStore } from '@/store/flowStore';
import { usePayload } from './usePayload';

vi.mock('@/utils/getExtensionId', () => ({
  getConfiguredExtensionIds: vi.fn(() => ['ext-1']),
}));

vi.mock('@/utils/appError', () => ({
  logSoftFailure: vi.fn(),
  reportAppError: vi.fn(),
}));

import { getConfiguredExtensionIds } from '@/utils/getExtensionId';

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>;
}

function makePayload(): FlowPayload {
  return {
    flow: {
      title: 'Doc',
      description: '',
      version: '1.0.0',
      category: 'general',
      tags: [],
    },
    metadata: {
      createdAt: 1,
      browser: 'test',
      platform: 'test',
      screen: { width: 1, height: 1 },
    },
    steps: [
      {
        id: 's1',
        title: 'Step',
        notes: '',
        generatedTitle: 'Step',
        generatedDescription: '',
        screenshotId: 'shot-1',
        event: {
          id: 'e1',
          type: 'page-view',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Page',
          viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
          screenshotId: 'shot-1',
        },
      },
    ],
  };
}

function mockBridgeHandoff(payload: FlowPayload | null) {
  vi.spyOn(window, 'postMessage').mockImplementation((message: unknown) => {
    const data = message as { type?: string };
    if (data?.type !== HANDOFF_REQUEST) return;
    queueMicrotask(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: HANDOFF_RESPONSE,
            ok: Boolean(payload),
            payload: payload ?? undefined,
            screenshotUrls: payload ? { 'shot-1': 'blob:1' } : {},
          },
          origin: window.location.origin,
          source: window,
        }),
      );
    });
  });
}

describe('usePayload', () => {
  beforeEach(() => {
    useFlowStore.getState().resetFlow();
    vi.mocked(getConfiguredExtensionIds).mockReturnValue(['ext-1']);
    Object.defineProperty(window, 'chrome', {
      configurable: true,
      value: {
        runtime: {
          sendMessage: vi.fn((_id: string, _msg: unknown, cb?: (r: unknown) => void) => {
            cb?.(null);
          }),
          lastError: undefined,
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete window.chrome;
    useFlowStore.getState().resetFlow();
  });

  it('does nothing when disabled', () => {
    const { result } = renderHook(() => usePayload({ enabled: false }), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('skips loading when flow is already loaded', () => {
    useFlowStore.getState().setFlow(makePayload(), {});
    const { result } = renderHook(() => usePayload(), { wrapper });
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('loads handoff via extension id', async () => {
    const payload = makePayload();
    const sendMessage = vi.fn(
      (_id: string, msg: { type?: string }, cb?: (r: unknown) => void) => {
        if (msg?.type === 'GET_PENDING_HANDOFF') {
          cb?.({ payload, screenshotUrls: { 'shot-1': 'blob:1' } });
          return;
        }
        cb?.(undefined);
      },
    );
    Object.defineProperty(window, 'chrome', {
      configurable: true,
      value: { runtime: { sendMessage, lastError: undefined } },
    });

    const { result } = renderHook(() => usePayload(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(useFlowStore.getState().isLoaded).toBe(true);
  });

  it('falls back to bridge when extension handoff is empty', async () => {
    const payload = makePayload();
    mockBridgeHandoff(payload);

    const { result } = renderHook(() => usePayload(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(useFlowStore.getState().isLoaded).toBe(true);
  });

  it('sets error when no handoff is available', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePayload(), { wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(12000);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toMatch(/No pending flow from the extension/i);
  });

  it('uses rebuild guidance when no extension ids are configured', async () => {
    vi.mocked(getConfiguredExtensionIds).mockReturnValue([]);
    vi.useFakeTimers();
    const { result } = renderHook(() => usePayload(), { wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(12000);
    });

    expect(result.current.error).toMatch(/Rebuild the app with VITE_EXTENSION_ID/i);
  });

  it('reports quota-style save errors', async () => {
    const payload = makePayload();
    const sendMessage = vi.fn(
      (_id: string, msg: { type?: string }, cb?: (r: unknown) => void) => {
        if (msg?.type === 'GET_PENDING_HANDOFF') {
          cb?.({ payload, screenshotUrls: {} });
          return;
        }
        cb?.(undefined);
      },
    );
    Object.defineProperty(window, 'chrome', {
      configurable: true,
      value: { runtime: { sendMessage, lastError: undefined } },
    });

    const setFlowSpy = vi.spyOn(useFlowStore.getState(), 'setFlow').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    const { result } = renderHook(() => usePayload(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toMatch(/storage is full/i);
    setFlowSpy.mockRestore();
  });
});
