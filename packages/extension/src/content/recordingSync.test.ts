import { describe, expect, it, vi } from 'vitest';
import { syncRecordingStateFromBackground, watchRecordingState } from './recordingSync';

describe('recordingSync', () => {
  it('requests recording state from the background', async () => {
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation((_message, callback) => {
      (callback as ((response: unknown) => void) | undefined)?.({
        status: 'recording',
        eventCount: 2,
        startedAt: 10,
      });
      return undefined as never;
    });

    await expect(syncRecordingStateFromBackground()).resolves.toEqual({
      status: 'recording',
      eventCount: 2,
      startedAt: 10,
    });
  });

  it('watches session storage changes for recording status updates', () => {
    const onUpdate = vi.fn();
    const getCurrent = vi.fn(() => ({
      status: 'idle' as const,
      eventCount: 4,
      startedAt: null,
    }));

    watchRecordingState(onUpdate, getCurrent);

    const mock = globalThis.__chromeMock!;
    mock.storage.onChanged.emit(
      {
        peacockRecordingState: {
          newValue: { status: 'paused', startedAt: 99 },
        },
      },
      'session',
    );

    expect(onUpdate).toHaveBeenCalledWith({
      status: 'paused',
      eventCount: 4,
      startedAt: 99,
    });
  });

  it('ignores non-session areas and empty values', () => {
    const onUpdate = vi.fn();
    watchRecordingState(onUpdate, () => ({
      status: 'idle',
      eventCount: 0,
      startedAt: null,
    }));

    const mock = globalThis.__chromeMock!;
    mock.storage.onChanged.emit(
      { peacockRecordingState: { newValue: { status: 'recording', startedAt: 1 } } },
      'local',
    );
    mock.storage.onChanged.emit({ other: { newValue: 1 } }, 'session');
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
