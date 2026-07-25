import { compressImageToMaxBytes, createId } from '@peacock/shared';
import { db } from '../storage/db';
import { dataUrlToBlob, sleep } from '../utils/blob';
import { getRecordingStatus } from './recordingState';

let lastVisibleCaptureAt = 0;

async function waitForCaptureQuota(): Promise<void> {
  const tabsApiWithQuota = chrome.tabs as typeof chrome.tabs & {
    MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND?: number;
  };
  const maxCallsPerSecond =
    typeof tabsApiWithQuota.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND === 'number'
      ? tabsApiWithQuota.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND
      : 2;
  const minIntervalMs = Math.ceil(1000 / Math.max(1, maxCallsPerSecond)) + 25;
  const waitMs = lastVisibleCaptureAt + minIntervalMs - Date.now();

  if (waitMs > 0) {
    await sleep(waitMs);
  }
}

async function captureVisibleTabBlobByWindow(windowId: number): Promise<Blob> {
  await waitForCaptureQuota();
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
  lastVisibleCaptureAt = Date.now();
  return dataUrlToBlob(dataUrl);
}

export async function captureVisibleScreenshotBlob(
  tabId: number,
  windowId?: number
): Promise<Blob> {
  const captureWindowId = windowId ?? (await chrome.tabs.get(tabId)).windowId;
  return captureVisibleTabBlobByWindow(captureWindowId);
}

export async function captureScreenshot(tabId: number, windowId?: number): Promise<string> {
  const status = await getRecordingStatus();
  if (status !== 'recording' && status !== 'paused') {
    throw new Error('Recording is not active');
  }

  const blob = await captureVisibleScreenshotBlob(tabId, windowId);
  const compressed = await compressImageToMaxBytes(blob);
  const id = createId();

  await db.screenshots.add({ id, blob: compressed, tabId, timestamp: Date.now() });

  return id;
}
