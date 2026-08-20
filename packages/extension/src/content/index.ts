import {
  createId,
  collectCaptureEnvironmentFromWindow,
  extractElementSnapshot,
  getEventTargetElement,
  getViewport,
  isSensitiveField,
  normalizePosition,
  resolveClickTarget,
  type ClickEvent,
  type ExtensionMessage,
  type FlowEvent,
  type NavigationEvent,
  type PageViewEvent,
  type RecordingStateSnapshot,
} from '@peacock/shared';
import { sendExtensionMessage } from '../messaging/sendExtensionMessage';
import {
  initInputCapture,
  isSubmitClickTarget,
  markSubmitSuppressedByClick,
  shouldDeferClickToInputEvent,
} from './inputCapture';
import { initNavigationTracking } from './navigation';
import { isPeacockUiElement, isSensitiveUrl } from './privacy';
import {
  hideRecordingUiForCapture,
  initRecordingUi,
  restoreRecordingUiAfterCapture,
  updateRecordingUi,
} from './recordingUi';
import { syncRecordingStateFromBackground, watchRecordingState } from './recordingSync';
import { isSameResolvedTarget } from './sameResolvedTarget';

let recordingState: RecordingStateSnapshot = {
  status: 'idle',
  eventCount: 0,
  startedAt: null,
};

const pointerCaptureMaxAgeMs = 800;

interface PendingPointerCapture {
  promise: Promise<string>;
  target: EventTarget;
  startedAt: number;
}

let pendingPointerCapture: PendingPointerCapture | null = null;
let flushPendingInputs: (() => Promise<void>) | null = null;

const PEACOCK_INIT_KEY = '__peacockContentScriptInitialized';

function isTopFrame(): boolean {
  return window === window.top;
}

async function refreshRecordingState(): Promise<RecordingStateSnapshot> {
  recordingState = await syncRecordingStateFromBackground();
  updateRecordingUi(recordingState);
  return recordingState;
}

function isRecordingActiveSync(): boolean {
  return recordingState.status === 'recording';
}

async function isRecordingActive(): Promise<boolean> {
  const state = await refreshRecordingState();
  return state.status === 'recording';
}

function resolveRecordingTarget(event: Event): HTMLElement | null {
  const raw = getEventTargetElement(event);
  const resolved = resolveClickTarget(raw);
  if (!resolved) return null;
  if (isPeacockUiElement(resolved)) return null;
  if (resolved instanceof HTMLInputElement && isSensitiveField(resolved)) return null;
  return resolved;
}

function beginPointerScreenshot(target: EventTarget): void {
  pendingPointerCapture = {
    promise: tryCaptureScreenshotId(),
    target,
    startedAt: Date.now(),
  };
}

async function screenshotIdForClick(target: EventTarget): Promise<string> {
  const pending = pendingPointerCapture;
  pendingPointerCapture = null;

  if (
    pending &&
    Date.now() - pending.startedAt < pointerCaptureMaxAgeMs &&
    isSameResolvedTarget(pending.target, target)
  ) {
    return pending.promise;
  }

  return tryCaptureScreenshotId();
}

function waitForUiPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function tryCaptureScreenshotId(): Promise<string> {
  hideRecordingUiForCapture();

  try {
    await waitForUiPaint();

    const response = await sendExtensionMessage<{ screenshotId?: string }>({
      type: 'CAPTURE_SCREENSHOT',
    });
    return response.screenshotId ?? '';
  } catch (error) {
    console.warn('[Peacock] Screenshot capture failed; storing step without image.', error);
    return '';
  } finally {
    restoreRecordingUiAfterCapture(recordingState);
  }
}

async function storeEvent(event: FlowEvent): Promise<void> {
  await sendExtensionMessage({ type: 'STORE_EVENT', event });
  recordingState = await sendExtensionMessage<RecordingStateSnapshot>({ type: 'GET_RECORDING_STATE' });
  updateRecordingUi(recordingState);
}

function handlePointerDown(event: PointerEvent): void {
  if (!isRecordingActiveSync()) return;
  if (event.button !== 0) return;

  const target = resolveRecordingTarget(event);
  if (!target) return;
  if (shouldDeferClickToInputEvent(target)) return;

  beginPointerScreenshot(target);
}

async function handleClick(event: MouseEvent): Promise<void> {
  if (!(await isRecordingActive())) return;

  const target = resolveRecordingTarget(event);
  if (!target) return;
  if (shouldDeferClickToInputEvent(target)) return;
  if (isSubmitClickTarget(target)) {
    markSubmitSuppressedByClick();
  }

  const screenshotId = await screenshotIdForClick(target);
  const viewport = getViewport();
  const normalized = normalizePosition(event.clientX, event.clientY, viewport);
  const element = extractElementSnapshot(target);

  const clickEvent: ClickEvent = {
    id: createId(),
    type: 'click',
    timestamp: Date.now(),
    url: location.href,
    title: document.title,
    viewport,
    position: {
      x: event.clientX,
      y: event.clientY,
      ...normalized,
    },
    element,
    screenshotId,
  };

  await storeEvent(clickEvent);
}

async function waitForPageSettle(): Promise<void> {
  if (document.readyState === 'loading') {
    await new Promise<void>((resolve) => {
      window.addEventListener('load', () => resolve(), { once: true });
    });
  }

  await waitForUiPaint();
  await new Promise((resolve) => window.setTimeout(resolve, 100));
}

async function captureNavigationPageView(): Promise<void> {
  if (!isTopFrame()) return;
  if (!(await isRecordingActive())) return;

  await waitForPageSettle();

  const screenshotId = await tryCaptureScreenshotId();
  const pageViewEvent: PageViewEvent = {
    id: createId(),
    type: 'page-view',
    timestamp: Date.now(),
    url: location.href,
    title: document.title,
    viewport: getViewport(),
    screenshotId,
    navigationRedirect: true,
  };

  await storeEvent(pageViewEvent);
}

async function captureInitialPageView(): Promise<void> {
  if (!isTopFrame()) return;
  if (!(await isRecordingActive())) return;

  const screenshotId = await tryCaptureScreenshotId();
  const pageViewEvent: PageViewEvent = {
    id: createId(),
    type: 'page-view',
    timestamp: Date.now(),
    url: location.href,
    title: document.title,
    viewport: getViewport(),
    screenshotId,
  };

  await storeEvent(pageViewEvent);
}

async function captureManualPageSnapshot(): Promise<void> {
  const state = await refreshRecordingState();
  if (state.status === 'idle') return;

  const screenshotId = await tryCaptureScreenshotId();
  const pageViewEvent: PageViewEvent = {
    id: createId(),
    type: 'page-view',
    timestamp: Date.now(),
    url: location.href,
    title: document.title,
    viewport: getViewport(),
    screenshotId,
  };

  await storeEvent(pageViewEvent);
}

async function captureFinalPageSnapshot(): Promise<{
  screenshotId: string;
  url: string;
  title: string;
  viewport: ReturnType<typeof getViewport>;
}> {
  const state = await refreshRecordingState();
  if (state.status === 'idle') {
    throw new Error('Recording is already idle');
  }

  const screenshotId = await tryCaptureScreenshotId();
  return {
    screenshotId,
    url: location.href,
    title: document.title,
    viewport: getViewport(),
  };
}

async function handleRecordingStarted(): Promise<void> {
  await refreshRecordingState();
  if (!isRecordingActiveSync()) return;

  if (isTopFrame()) {
    updateRecordingUi(recordingState);
    await captureInitialPageView();
  }
}

async function handleNavigation(event: NavigationEvent): Promise<void> {
  if (!(await isRecordingActive())) return;

  if (isSensitiveUrl(event.toUrl)) {
    await sendExtensionMessage({ type: 'PAUSE_RECORDING' });
    await refreshRecordingState();
    return;
  }

  await captureNavigationPageView();
}

async function stopRecordingFromUi(): Promise<void> {
  await sendExtensionMessage({ type: 'STOP_RECORDING' });
  await refreshRecordingState();
}

function initEventListeners(): void {
  document.addEventListener(
    'pointerdown',
    (event) => {
      handlePointerDown(event);
    },
    true,
  );

  document.addEventListener(
    'click',
    (event) => {
      void handleClick(event).catch((error) => {
        console.error('[Peacock] Failed to store click event', error);
      });
    },
    true,
  );

  const inputCapture = initInputCapture({
    isRecordingActive: isRecordingActiveSync,
    storeEvent,
    captureScreenshotId: tryCaptureScreenshotId,
    isPeacockUi: isPeacockUiElement,
  });
  flushPendingInputs = inputCapture.flushAllPending;

  initNavigationTracking((navigationEvent) => {
    void handleNavigation(navigationEvent).catch((error) => {
      console.error('[Peacock] Failed to store navigation event', error);
    });
  });
}

function registerRuntimeListeners(): void {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'RECORDING_STATE') {
      recordingState = message.state;
      updateRecordingUi(recordingState);
      return;
    }

    if (message.type === 'RECORDING_STARTED') {
      void handleRecordingStarted().catch((error) => {
        console.error('[Peacock] Failed to capture initial page view', error);
      });
      return;
    }

    if (message.type === 'CAPTURE_ENVIRONMENT') {
      const startedAt = message.recordingStartedAt;
      const environment = collectCaptureEnvironmentFromWindow(startedAt, startedAt);
      sendResponse({ environment });
      return true;
    }

    if (message.type === 'FLUSH_PENDING_INPUTS') {
      void (flushPendingInputs?.() ?? Promise.resolve())
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          console.error('[Peacock] Failed to flush pending inputs', error);
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }

    if (message.type === 'CAPTURE_NAVIGATION_PAGE_VIEW') {
      void captureNavigationPageView()
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          console.error('[Peacock] Failed to capture navigation page view', error);
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }

    if (message.type === 'CAPTURE_FINAL_PAGE') {
      void captureFinalPageSnapshot()
        .then((finalPage) => sendResponse(finalPage))
        .catch((error) => {
          console.error('[Peacock] Failed to capture final page view', error);
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }

    if (message.type === 'CAPTURE_PAGE_SNAPSHOT') {
      void captureManualPageSnapshot()
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          console.error('[Peacock] Failed to capture manual page snapshot', error);
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }
  });
}

function bootstrapContentScript(): void {
  watchRecordingState(
    (state) => {
      recordingState = state;
      updateRecordingUi(recordingState);
    },
    () => recordingState,
  );

  if (isTopFrame()) {
    initRecordingUi(
      () => {
        void stopRecordingFromUi();
      },
      () => {
        void captureManualPageSnapshot().catch((error) => {
          console.error('[Peacock] Failed to capture page snapshot from badge', error);
        });
      },
    );
  }
  initEventListeners();

  void refreshRecordingState().catch((error) => {
    console.warn('[Peacock] Could not sync recording state', error);
  });
}

registerRuntimeListeners();

const peacockWindow = window as Window & { [PEACOCK_INIT_KEY]?: boolean };

if (!peacockWindow[PEACOCK_INIT_KEY]) {
  peacockWindow[PEACOCK_INIT_KEY] = true;
  bootstrapContentScript();
  chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY', url: location.href }).catch(() => {});
} else {
  void refreshRecordingState().catch(() => {});
}
