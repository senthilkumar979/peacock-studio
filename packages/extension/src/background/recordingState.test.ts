import { describe, expect, it, vi } from 'vitest';
import {
  getRecordingState,
  getRecordingStatus,
  setRecordingStatus,
} from './recordingState';

describe('recordingState', () => {
  it('defaults to idle with provided event count', async () => {
    await expect(getRecordingState(3)).resolves.toEqual({
      status: 'idle',
      eventCount: 3,
      startedAt: null,
    });
    await expect(getRecordingStatus()).resolves.toBe('idle');
  });

  it('sets startedAt when entering recording', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(42_000);
    await setRecordingStatus('recording');
    await expect(getRecordingState(0)).resolves.toEqual({
      status: 'recording',
      eventCount: 0,
      startedAt: 42_000,
    });
  });

  it('preserves startedAt across pause', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100);
    await setRecordingStatus('recording');
    vi.spyOn(Date, 'now').mockReturnValue(200);
    await setRecordingStatus('paused');
    await expect(getRecordingStatus()).resolves.toBe('paused');
    await expect(getRecordingState(2)).resolves.toMatchObject({
      status: 'paused',
      startedAt: 100,
    });
  });

  it('clears startedAt when returning to idle', async () => {
    await setRecordingStatus('recording');
    await setRecordingStatus('idle');
    await expect(getRecordingState(0)).resolves.toEqual({
      status: 'idle',
      eventCount: 0,
      startedAt: null,
    });
  });
});
