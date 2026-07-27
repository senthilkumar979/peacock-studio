import { createId, type ExtensionMessage, type FlowCaptureEnvironment, type FlowEvent, type PageViewEvent, type Viewport, getFlowEventUrl } from '@peacock/shared';
import {
  cropVisibleCapture,
  openCaptureResult,
  stitchFullPageCaptures,
  type ScreenshotToolMode,
} from './captureResult';
import {
  addStoredEvent,
  clearRecordingData,
  getEventCount,
  getLatestStoredEvent,
  putStoredEvent,
  storeEventWithCoalescing,
} from '../storage/db';
import { buildPayloadFromRecording, type PendingHandoff } from '../utils/payload';
import {
  getRecordingState,
  getRecordingStatus,
  setRecordingStatus,
} from './recordingState';
import { canInjectIntoUrl, ensureContentScript } from './injectContentScript';
import { buildCaptureResultHandoff } from './captureHandoff';
import { captureScreenshot, captureVisibleScreenshotBlob } from './screenshot';
import {
  clearCaptureSession,
  finalizeCaptureSession,
  saveCaptureSession,
  saveFinalCaptureEnvironment,
} from './captureSession';

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

interface CaptureToolMetrics {
  fullWidth: number;
  fullHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
}

interface CaptureToolScrollResponse {
  scrollY: number;
  error?: string;
}

interface CaptureToolOverlayResponse {
  count: number;
  error?: string;
}

interface SelectionCaptureArea {
  left: number;
  top: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  error?: string;
}

async function requestNavigationPageViewCapture(tabId: number): Promise<void> {
  const isReady = await ensureContentScript(tabId);
  if (!isReady) return;

  await chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_NAVIGATION_PAGE_VIEW' });
  await broadcastRecordingState();
}

async function handleContentScriptReady(url: string, tabId?: number): Promise<void> {
  if (!tabId) return;

  const status = await getRecordingStatus();
  if (status !== 'recording' && status !== 'paused') return;

  const latestEvent = await getLatestStoredEvent();
  if (!latestEvent) return;

  const latestUrl = getFlowEventUrl(latestEvent);
  if (latestUrl === url) return;

  if (
    latestEvent.type === 'page-view' &&
    latestEvent.navigationRedirect &&
    latestEvent.url === url
  ) {
    return;
  }

  try {
    await requestNavigationPageViewCapture(tabId);
  } catch (error) {
    console.warn('[Peacock] Could not capture navigation page view on tab load', error);
  }
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

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id || !activeTab.url || activeTab.windowId === undefined) {
    throw new Error('Could not find the active tab');
  }
  return activeTab;
}

async function ensureCaptureTool(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['capture-tool/index.js'],
  });
}

async function sendCaptureToolMessage<T>(tabId: number, message: object): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message) as Promise<T>;
}

function buildScrollStops(fullHeight: number, viewportHeight: number): number[] {
  const maxScroll = Math.max(0, fullHeight - viewportHeight);
  if (maxScroll === 0) return [0];

  const stops: number[] = [];
  for (let top = 0; top < maxScroll; top += viewportHeight) {
    stops.push(top);
  }
  stops.push(maxScroll);
  return [...new Set(stops)];
}

async function handleVisibleScreenshotTool(tab: chrome.tabs.Tab): Promise<void> {
  const blob = await captureVisibleScreenshotBlob(tab.id as number, tab.windowId);
  await openCaptureResult(blob, 'visible');
}

async function handleSelectionScreenshotTool(tab: chrome.tabs.Tab): Promise<void> {
  if (!canInjectIntoUrl(tab.url)) {
    throw new Error('Selection capture is not available on this page');
  }

  await ensureCaptureTool(tab.id as number);
  const selection = await sendCaptureToolMessage<SelectionCaptureArea | null>(
    tab.id as number,
    { type: 'PEACOCK_START_SELECTION_CAPTURE' }
  );

  if (!selection) return;
  if (selection.error) throw new Error(selection.error);

  const visibleBlob = await captureVisibleScreenshotBlob(tab.id as number, tab.windowId);
  const croppedBlob = await cropVisibleCapture(visibleBlob, selection);
  await openCaptureResult(croppedBlob, 'selection');
}

async function handleFullPageScreenshotTool(tab: chrome.tabs.Tab): Promise<void> {
  if (!canInjectIntoUrl(tab.url)) {
    throw new Error('Full-page capture is not available on this page');
  }

  const tabId = tab.id as number;
  await ensureCaptureTool(tabId);

  const metrics = await sendCaptureToolMessage<CaptureToolMetrics>(tabId, {
    type: 'PEACOCK_GET_CAPTURE_METRICS',
  });
  const scrollStops = buildScrollStops(metrics.fullHeight, metrics.viewportHeight);
  const slices: Array<{ blob: Blob; scrollY: number }> = [];
  let overlaysSuppressed = false;

  try {
    for (const [index, top] of scrollStops.entries()) {
      const response = await sendCaptureToolMessage<CaptureToolScrollResponse>(tabId, {
        type: 'PEACOCK_SCROLL_CAPTURE_PAGE',
        top,
      });
      if (response.error) throw new Error(response.error);

      if (index > 0 && !overlaysSuppressed) {
        const discovery = await sendCaptureToolMessage<CaptureToolOverlayResponse>(tabId, {
          type: 'PEACOCK_DISCOVER_VIEWPORT_OVERLAYS',
        });
        if (discovery.error) throw new Error(discovery.error);

        if (discovery.count > 0) {
          const suppression = await sendCaptureToolMessage<CaptureToolOverlayResponse>(tabId, {
            type: 'PEACOCK_SET_VIEWPORT_OVERLAYS_SUPPRESSED',
            suppressed: true,
          });
          if (suppression.error) throw new Error(suppression.error);
          overlaysSuppressed = suppression.count > 0;
        }
      }

      const blob = await captureVisibleScreenshotBlob(tabId, tab.windowId);
      slices.push({ blob, scrollY: response.scrollY });
    }
  } finally {
    if (overlaysSuppressed) {
      await sendCaptureToolMessage<CaptureToolOverlayResponse>(tabId, {
        type: 'PEACOCK_SET_VIEWPORT_OVERLAYS_SUPPRESSED',
        suppressed: false,
      }).catch(() => undefined);
    }

    await sendCaptureToolMessage<{ success?: boolean; error?: string }>(tabId, {
      type: 'PEACOCK_RESTORE_CAPTURE_PAGE',
      scrollX: metrics.scrollX,
      scrollY: metrics.scrollY,
    }).catch(() => undefined);
  }

  const stitchedBlob = await stitchFullPageCaptures(
    slices,
    metrics.fullHeight,
    metrics.viewportWidth
  );
  await openCaptureResult(stitchedBlob, 'full-page');
}

async function handleScreenshotTool(mode: ScreenshotToolMode): Promise<void> {
  const activeTab = await getActiveTab();

  if (mode === 'visible') {
    await handleVisibleScreenshotTool(activeTab);
    return;
  }

  if (mode === 'selection') {
    await handleSelectionScreenshotTool(activeTab);
    return;
  }

  await handleFullPageScreenshotTool(activeTab);
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

async function captureEnvironmentFromTab(
  tabId: number,
  recordingStartedAt: number,
): Promise<void> {
  try {
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: 'CAPTURE_ENVIRONMENT',
      recordingStartedAt,
    })) as { environment?: FlowCaptureEnvironment } | undefined;

    if (response?.environment) {
      await saveCaptureSession({
        recordingStartedAt,
        environment: response.environment,
      });
    }
  } catch (error) {
    console.warn('[Peacock] Could not capture recording environment', error);
  }
}

async function handleStartRecording(): Promise<void> {
  await clearRecordingData();
  await clearCaptureSession();
  await clearHandoffPending();
  handoffBuildPromise = null;
  cachedHandoff = undefined;
  await setRecordingStatus('recording');

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const state = await getRecordingState(await getEventCount());
  const startedAt = state.startedAt ?? Date.now();

  if (activeTab?.id && canInjectIntoUrl(activeTab.url)) {
    const isReady = await ensureContentScript(activeTab.id);
    if (isReady) {
      try {
        await chrome.tabs.sendMessage(activeTab.id, { type: 'RECORDING_STARTED' });
        await chrome.tabs.sendMessage(activeTab.id, { type: 'RECORDING_STATE', state });
        await captureEnvironmentFromTab(activeTab.id, startedAt);
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

async function flushPendingInputsOnTab(tab?: chrome.tabs.Tab): Promise<void> {
  const targetTab =
    tab ??
    (await chrome.tabs.query({ active: true, currentWindow: true })).find((candidate) =>
      canInjectIntoUrl(candidate.url),
    );

  if (!targetTab?.id || !canInjectIntoUrl(targetTab.url)) return;

  const isReady = await ensureContentScript(targetTab.id);
  if (!isReady) return;

  try {
    await chrome.tabs.sendMessage(targetTab.id, { type: 'FLUSH_PENDING_INPUTS' });
  } catch (error) {
    console.warn('[Peacock] Could not flush pending inputs before stop', error);
  }
}

async function handleStopRecording(tab?: chrome.tabs.Tab): Promise<void> {
  const endedAt = Date.now();
  const captureEnvironment = await finalizeCaptureSession(endedAt);
  if (captureEnvironment) {
    await saveFinalCaptureEnvironment(captureEnvironment);
  }

  await flushPendingInputsOnTab(tab);

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

          await storeEventWithCoalescing(message.event);
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

        case 'START_SCREENSHOT_TOOL':
          await handleScreenshotTool(message.mode);
          sendResponse({ success: true });
          break;

        case 'PING':
          sendResponse({ success: true });
          break;

        case 'CONTENT_SCRIPT_READY':
          console.info('[Peacock] Content script ready on', message.url);
          await handleContentScriptReady(message.url, sender.tab?.id);
          sendResponse({ success: true });
          break;

        case 'GET_CAPTURE_RESULT': {
          const handoff = await buildCaptureResultHandoff(message.captureId);
          sendResponse(handoff);
          break;
        }

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

/** Web pages listed in externally_connectable talk to the extension here. */
chrome.runtime.onMessageExternal.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  void (async () => {
    try {
      switch (message.type) {
        case 'PING':
          sendResponse({ success: true });
          break;

        case 'APP_READY':
        case 'GET_PENDING_HANDOFF': {
          const handoff = await deliverPendingHandoff();
          sendResponse(
            handoff
              ? { payload: handoff.payload, screenshotUrls: handoff.screenshotUrls }
              : { payload: null },
          );
          break;
        }

        case 'GET_CAPTURE_RESULT': {
          const handoff = await buildCaptureResultHandoff(message.captureId);
          sendResponse(handoff);
          break;
        }

        default:
          sendResponse({ error: 'Unsupported external message type' });
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Peacock] external message failed', message.type, error);
      sendResponse({ error: messageText });
    }
  })();

  return true;
});

chrome.tabs.onActivated.addListener(() => {
  void getRecordingStatus();
});

export { HANDOFF_PENDING_KEY };
