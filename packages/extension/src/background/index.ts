import { createId, type ExtensionMessage, type FlowEvent, type PageViewEvent, type Viewport } from '@peacock/shared';
import {
  addStoredEvent,
  clearRecordingData,
  getEventCount,
  getLatestStoredEvent,
  putStoredEvent,
} from '../storage/db';
import { buildPayloadFromRecording, type PendingHandoff } from '../utils/payload';
import {
  getRecordingState,
  getRecordingStatus,
  setRecordingStatus,
} from './recordingState';
import { canInjectIntoUrl, ensureContentScript } from './injectContentScript';
import { captureScreenshot } from './screenshot';

const APP_URL = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173/editor';
const HANDOFF_PENDING_KEY = 'peacockHandoffPending';

interface HandoffPendingFlag {
  pending: boolean;
  createdAt: number;
}

let handoffBuildPromise: Promise<PendingHandoff | null> | null = null;
let cachedHandoff: PendingHandoff | null | undefined;

interface FinalPageCapture {
  screenshotId: string;
  url: string;
  title: string;
  viewport: Viewport;
}

async function broadcastRecordingState(): Promise<void> {
  const state = await getRecordingState(await getEventCount());
  const tabs = await chrome.tabs.query({});

  for (const tab of tabs) {
    if (!tab.id) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'RECORDING_STATE', state });
    } catch {
      // Tab may not have the content script loaded.
    }
  }
}

async function markHandoffPending(): Promise<void> {
  const flag: HandoffPendingFlag = { pending: true, createdAt: Date.now() };
  await chrome.storage.local.set({ [HANDOFF_PENDING_KEY]: flag });
}

async function hasHandoffPending(): Promise<boolean> {
  const stored = await chrome.storage.local.get(HANDOFF_PENDING_KEY);
  const flag = stored[HANDOFF_PENDING_KEY] as HandoffPendingFlag | undefined;
  if (flag?.pending) return true;
  return (await getEventCount()) > 0;
}

async function clearHandoffPending(): Promise<void> {
  await chrome.storage.local.remove(HANDOFF_PENDING_KEY);
}

async function handleStartRecording(): Promise<void> {
  await clearRecordingData();
  await clearHandoffPending();
  handoffBuildPromise = null;
  cachedHandoff = undefined;
  await setRecordingStatus('recording');

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const state = await getRecordingState(await getEventCount());

  if (activeTab?.id && canInjectIntoUrl(activeTab.url)) {
    const isReady = await ensureContentScript(activeTab.id);
    if (isReady) {
      try {
        await chrome.tabs.sendMessage(activeTab.id, { type: 'RECORDING_STARTED' });
        await chrome.tabs.sendMessage(activeTab.id, { type: 'RECORDING_STATE', state });
      } catch (error) {
        console.warn('[Peacock] Could not notify tab to start recording', error);
      }
    }
  }

  await broadcastRecordingState();
}

async function applyFinalPageCapture(finalPage: FinalPageCapture): Promise<void> {
  const latestEvent = await getLatestStoredEvent();
  if (!latestEvent) return;

  if (latestEvent.type === 'navigation') {
    const pageViewEvent: PageViewEvent = {
      id: createId(),
      type: 'page-view',
      timestamp: Date.now(),
      url: finalPage.url,
      title: finalPage.title,
      viewport: finalPage.viewport,
      screenshotId: finalPage.screenshotId,
    };
    await addStoredEvent(pageViewEvent);
    return;
  }

  if (latestEvent.type === 'page-view' && latestEvent.url === finalPage.url) {
    await putStoredEvent({
      ...latestEvent,
      url: finalPage.url,
      title: finalPage.title,
      viewport: finalPage.viewport,
      screenshotId: finalPage.screenshotId,
    });
    return;
  }

  if (latestEvent.url === finalPage.url) {
    await putStoredEvent({
      ...latestEvent,
      title: finalPage.title,
      screenshotId: finalPage.screenshotId,
    } satisfies FlowEvent);
    return;
  }

  const pageViewEvent: PageViewEvent = {
    id: createId(),
    type: 'page-view',
    timestamp: Date.now(),
    url: finalPage.url,
    title: finalPage.title,
    viewport: finalPage.viewport,
    screenshotId: finalPage.screenshotId,
  };
  await addStoredEvent(pageViewEvent);
}

async function captureFinalPageBeforeStop(tab?: chrome.tabs.Tab): Promise<boolean> {
  const targetTab =
    tab ??
    (await chrome.tabs.query({ active: true, currentWindow: true })).find((candidate) =>
      canInjectIntoUrl(candidate.url)
    );

  if (!targetTab?.id || !canInjectIntoUrl(targetTab.url)) return false;

  const isReady = await ensureContentScript(targetTab.id);
  if (!isReady) return false;

  try {
    const finalPage = (await chrome.tabs.sendMessage(targetTab.id, {
      type: 'CAPTURE_FINAL_PAGE',
    })) as FinalPageCapture | undefined;
    if (!finalPage?.url) return false;
    await applyFinalPageCapture(finalPage);
    return true;
  } catch (error) {
    console.warn('[Peacock] Could not capture final page view before stop', error);
    return false;
  }
}

async function handleCapturePageSnapshot(tab?: chrome.tabs.Tab): Promise<void> {
  const targetTab =
    tab ??
    (await chrome.tabs.query({ active: true, currentWindow: true })).find((candidate) =>
      canInjectIntoUrl(candidate.url)
    );

  if (!targetTab?.id || !canInjectIntoUrl(targetTab.url)) {
    throw new Error('Current tab does not support screenshot capture');
  }

  const isReady = await ensureContentScript(targetTab.id);
  if (!isReady) {
    throw new Error('Could not connect to the current page');
  }

  await chrome.tabs.sendMessage(targetTab.id, { type: 'CAPTURE_PAGE_SNAPSHOT' });
  await broadcastRecordingState();
}

async function handleStopRecording(tab?: chrome.tabs.Tab): Promise<void> {
  const eventCount = await getEventCount();
  const capturedFinalPage = await captureFinalPageBeforeStop(tab);
  const finalEventCount = capturedFinalPage ? await getEventCount() : eventCount;

  if (finalEventCount > 0) {
    await markHandoffPending();
  }

  await setRecordingStatus('idle');
  await chrome.tabs.create({ url: APP_URL });
  await broadcastRecordingState();
}

async function buildAndDeliverHandoff(): Promise<PendingHandoff | null> {
  const shouldDeliver = await hasHandoffPending();
  if (!shouldDeliver) return null;

  try {
    const handoff = await buildPayloadFromRecording();
    if (!handoff.payload.steps.length) {
      await clearHandoffPending();
      return null;
    }

    await clearHandoffPending();
    await clearRecordingData();
    return handoff;
  } catch (error) {
    console.error('[Peacock] Failed to build handoff from IndexedDB', error);
    return null;
  }
}

async function deliverPendingHandoff(): Promise<PendingHandoff | null> {
  if (cachedHandoff !== undefined) {
    return cachedHandoff;
  }

  if (!handoffBuildPromise) {
    handoffBuildPromise = buildAndDeliverHandoff().finally(() => {
      handoffBuildPromise = null;
    });
  }

  const handoff = await handoffBuildPromise;
  cachedHandoff = handoff;
  return handoff;
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  void (async () => {
    try {
      switch (message.type) {
        case 'GET_RECORDING_STATE':
          sendResponse(await getRecordingState(await getEventCount()));
          break;

        case 'START_RECORDING':
          await handleStartRecording();
          sendResponse({ success: true });
          break;

        case 'PAUSE_RECORDING':
          await setRecordingStatus('paused');
          await broadcastRecordingState();
          sendResponse({ success: true });
          break;

        case 'RESUME_RECORDING':
          await setRecordingStatus('recording');
          await broadcastRecordingState();
          sendResponse({ success: true });
          break;

        case 'CAPTURE_SCREENSHOT': {
          const tabId = message.tabId ?? sender.tab?.id;
          if (!tabId) {
            sendResponse({ error: 'Missing tab id' });
            return;
          }
          const screenshotId = await captureScreenshot(tabId, sender.tab?.windowId);
          sendResponse({ screenshotId });
          break;
        }

        case 'STORE_EVENT': {
          const status = await getRecordingStatus();
          if (status !== 'recording' && status !== 'paused') {
            sendResponse({ error: 'Not recording' });
            return;
          }

          await addStoredEvent(message.event);
          const eventCount = await getEventCount();
          console.info('[Peacock] Stored event', message.event.type, 'count=', eventCount);
          await broadcastRecordingState();
          sendResponse({ success: true, eventCount });
          break;
        }

        case 'STOP_RECORDING':
          await handleStopRecording(sender.tab);
          sendResponse({ success: true });
          break;

        case 'CAPTURE_PAGE_SNAPSHOT':
          await handleCapturePageSnapshot(sender.tab);
          sendResponse({ success: true });
          break;

        case 'PING':
          sendResponse({ success: true });
          break;

        case 'CONTENT_SCRIPT_READY':
          console.info('[Peacock] Content script ready on', message.url);
          sendResponse({ success: true });
          break;

        case 'APP_READY':
        case 'GET_PENDING_HANDOFF': {
          const handoff = await deliverPendingHandoff();
          sendResponse(
            handoff
              ? { payload: handoff.payload, screenshotUrls: handoff.screenshotUrls }
              : { payload: null }
          );
          break;
        }

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      const message_text = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Peacock] background message failed', message.type, error);
      sendResponse({ error: message_text });
    }
  })();

  return true;
});

chrome.tabs.onActivated.addListener(() => {
  void getRecordingStatus();
});

export { HANDOFF_PENDING_KEY };
