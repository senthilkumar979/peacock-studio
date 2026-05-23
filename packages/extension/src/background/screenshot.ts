import { createId } from '@peacock/shared';
import { db } from '../storage/db';
import { dataUrlToBlob } from '../utils/blob';
import { getRecordingStatus } from './recordingState';

export async function captureScreenshot(tabId: number, windowId?: number): Promise<string> {
  const status = await getRecordingStatus();
  if (status !== 'recording') {
    throw new Error('Recording is not active');
  }

  const captureWindowId = windowId ?? (await chrome.tabs.get(tabId)).windowId;
  const dataUrl = await chrome.tabs.captureVisibleTab(captureWindowId, { format: 'png' });
  const blob = dataUrlToBlob(dataUrl);
  const id = createId();

  await db.screenshots.add({ id, blob, tabId, timestamp: Date.now() });

  return id;
}
