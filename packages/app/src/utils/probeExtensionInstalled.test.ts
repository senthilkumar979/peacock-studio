import {
  EXTENSION_PING_RESPONSE,
  HANDOFF_RESPONSE,
} from '@peacock/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXTENSION_DOM_MARKER, probeExtensionInstalled } from './probeExtensionInstalled';

vi.mock('@/utils/getExtensionId', () => ({
  getConfiguredExtensionIds: vi.fn(() => ['ext-a', 'ext-b']),
}));

import { getConfiguredExtensionIds } from '@/utils/getExtensionId';

describe('probeExtensionInstalled', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(EXTENSION_DOM_MARKER);
    vi.mocked(getConfiguredExtensionIds).mockReturnValue(['ext-a']);
    delete (window as { chrome?: unknown }).chrome;
  });

  afterEach(() => {
    document.documentElement.removeAttribute(EXTENSION_DOM_MARKER);
    vi.useRealTimers();
  });

  it('returns true when DOM marker is present', async () => {
    document.documentElement.setAttribute(EXTENSION_DOM_MARKER, 'installed');
    await expect(probeExtensionInstalled(50)).resolves.toBe(true);
  });

  it('returns true when bridge answers ping via postMessage', async () => {
    const promise = probeExtensionInstalled(500);
    queueMicrotask(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: EXTENSION_PING_RESPONSE },
          origin: window.location.origin,
          source: window,
        }),
      );
    });
    await expect(promise).resolves.toBe(true);
  });

  it('returns true when handoff response arrives', async () => {
    const promise = probeExtensionInstalled(500);
    queueMicrotask(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: HANDOFF_RESPONSE },
          origin: window.location.origin,
          source: window,
        }),
      );
    });
    await expect(promise).resolves.toBe(true);
  });

  it('falls back to chrome.runtime sendMessage success', async () => {
    const sendMessage = vi.fn((_id: string, _msg: unknown, cb: () => void) => {
      cb();
    });
    (window as { chrome?: unknown }).chrome = {
      runtime: { sendMessage, lastError: undefined },
    };

    await expect(probeExtensionInstalled(200)).resolves.toBe(true);
    expect(sendMessage).toHaveBeenCalled();
  });

  it('tries PING after GET_PENDING_HANDOFF lastError', async () => {
    let call = 0;
    const runtime = {
      lastError: undefined as { message: string } | undefined,
      sendMessage: vi.fn((_id: string, msg: { type: string }, cb: () => void) => {
        call += 1;
        if (msg.type === 'GET_PENDING_HANDOFF') {
          runtime.lastError = { message: 'missing' };
          cb();
          return;
        }
        runtime.lastError = undefined;
        cb();
      }),
    };
    (window as { chrome?: unknown }).chrome = { runtime };

    await expect(probeExtensionInstalled(400)).resolves.toBe(true);
    expect(call).toBeGreaterThanOrEqual(2);
  });

  it('returns false when no bridge and no runtime', async () => {
    vi.useFakeTimers();
    const promise = probeExtensionInstalled(100);
    await vi.advanceTimersByTimeAsync(150);
    await expect(promise).resolves.toBe(false);
  });

  it('returns false when configured ids are empty', async () => {
    vi.mocked(getConfiguredExtensionIds).mockReturnValue([]);
    (window as { chrome?: unknown }).chrome = {
      runtime: { sendMessage: vi.fn(), lastError: undefined },
    };
    vi.useFakeTimers();
    const promise = probeExtensionInstalled(50);
    await vi.advanceTimersByTimeAsync(80);
    await expect(promise).resolves.toBe(false);
  });
});
