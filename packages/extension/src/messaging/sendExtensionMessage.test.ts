import { describe, expect, it, vi } from 'vitest';
import { sendExtensionMessage } from './sendExtensionMessage';

describe('sendExtensionMessage', () => {
  it('resolves with the runtime response', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_message, callback) => {
      (callback as ((response: unknown) => void) | undefined)?.({ ok: true });
      return undefined as never;
    });

    await expect(sendExtensionMessage({ type: 'GET_RECORDING_STATE' })).resolves.toEqual({
      ok: true,
    });
  });

  it('rejects when chrome.runtime.lastError is set', async () => {
    const mock = globalThis.__chromeMock!;
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_message, callback) => {
      const cb = callback as ((response: unknown) => void) | undefined;
      mock.runtime.setLastError('Extension context invalidated.');
      cb?.(undefined);
      mock.runtime.setLastError(undefined);
      return undefined as never;
    });

    await expect(sendExtensionMessage({ type: 'PING' })).rejects.toThrow(
      'Extension context invalidated.',
    );
  });

  it('rejects when response contains an error field', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_message, callback) => {
      (callback as ((response: unknown) => void) | undefined)?.({ error: 'boom' });
      return undefined as never;
    });

    await expect(sendExtensionMessage({ type: 'STOP_RECORDING' })).rejects.toThrow('boom');
  });
});
