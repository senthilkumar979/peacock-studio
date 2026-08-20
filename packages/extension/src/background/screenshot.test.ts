import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../storage/db';

vi.mock('./recordingState', () => ({
  getRecordingStatus: vi.fn(),
}));

vi.mock('../utils/blob', async () => {
  const actual = await vi.importActual<typeof import('../utils/blob')>('../utils/blob');
  return {
    ...actual,
    sleep: vi.fn(async () => undefined),
  };
});

import { captureScreenshot, captureVisibleScreenshotBlob } from './screenshot';
import { getRecordingStatus } from './recordingState';

const mockedGetRecordingStatus = vi.mocked(getRecordingStatus);

describe('screenshot', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    mockedGetRecordingStatus.mockReset();
    (chrome.tabs.captureVisibleTab as ReturnType<typeof vi.fn>).mockResolvedValue(
      'data:image/png;base64,aGVsbG8=',
    );
    vi.mocked(chrome.tabs.get).mockResolvedValue({
      id: 5,
      windowId: 9,
    } as chrome.tabs.Tab);
  });

  it('captures a visible tab blob using provided window id', async () => {
    const blob = await captureVisibleScreenshotBlob(5, 9);
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledWith(9, { format: 'png' });
    expect(await blob.text()).toBe('hello');
  });

  it('looks up window id when omitted', async () => {
    await captureVisibleScreenshotBlob(5);
    expect(chrome.tabs.get).toHaveBeenCalledWith(5);
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledWith(9, { format: 'png' });
  });

  it('rejects captureScreenshot when recording is inactive', async () => {
    mockedGetRecordingStatus.mockResolvedValue('idle');
    await expect(captureScreenshot(5)).rejects.toThrow('Recording is not active');
  });

  it('stores a compressed screenshot while recording', async () => {
    mockedGetRecordingStatus.mockResolvedValue('recording');
    const id = await captureScreenshot(5, 9);
    expect(id).toBeTruthy();
    expect(await db.screenshots.count()).toBe(1);
  });

  it('allows paused recording status', async () => {
    mockedGetRecordingStatus.mockResolvedValue('paused');
    const id = await captureScreenshot(5, 9);
    expect(id).toBeTruthy();
  });

  it('uses default capture quota when chrome omits the constant', async () => {
    const tabsApi = chrome.tabs as typeof chrome.tabs & {
      MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND?: unknown;
    };
    tabsApi.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND = 'not-a-number';
    await captureVisibleScreenshotBlob(5, 9);
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalled();
    delete tabsApi.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND;
  });
});
