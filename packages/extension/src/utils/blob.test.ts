import { describe, expect, it, vi } from 'vitest';
import { dataUrlToBlob, sleep } from './blob';

describe('blob utils', () => {
  it('sleeps for the requested duration', async () => {
    vi.useFakeTimers();
    const promise = sleep(50);
    await vi.advanceTimersByTimeAsync(50);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('converts a data URL into a typed blob', async () => {
    const dataUrl = 'data:image/png;base64,aGVsbG8=';
    const blob = dataUrlToBlob(dataUrl);
    expect(blob.type).toBe('image/png');
    expect(await blob.text()).toBe('hello');
  });

  it('defaults mime type when header is missing', async () => {
    const blob = dataUrlToBlob('data:,dGVzdA==');
    expect(blob.type).toBe('image/png');
    expect(await blob.text()).toBe('test');
  });
});
