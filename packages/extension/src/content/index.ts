import {
  createId,
  extractElementSnapshot,
  getViewport,
  isSensitiveField,
  normalizePosition,
  type ClickEvent,
  type PageViewEvent,
  type ExtensionMessage,
  type FlowEvent,
  type InputEvent,
  type NavigationEvent,
  type RecordingStateSnapshot,
} from '@peacock/shared';
import { sendExtensionMessage } from '../messaging/sendExtensionMessage';
import { initNavigationTracking } from './navigation';
import { isPeacockUiElement, isSensitiveUrl } from './privacy';
import {
  hideRecordingUiForCapture,
  initRecordingUi,
  restoreRecordingUiAfterCapture,
  updateRecordingUi,
} from './recordingUi';
import { syncRecordingStateFromBackground, watchRecordingState } from './recordingSync';

let recordingState: RecordingStateSnapshot = {
  status: 'idle',
  eventCount: 0,
  startedAt: null,
};

const inputDebounceMs = 400;
const inputTimers = new Map<string, ReturnType<typeof setTimeout>>();
const pointerCaptureMaxAgeMs = 800;

interface PendingPointerCapture {
  promise: Promise<string>;
  target: EventTarget;
  startedAt: number;
}

let pendingPointerCapture: PendingPointerCapture | null = null;

const PEACOCK_INIT_KEY = '__peacockContentScriptInitialized';

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

function isValidClickTarget(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  if (isPeacockUiElement(target)) return false;
  if (target instanceof HTMLInputElement && isSensitiveField(target)) return false;
  return true;
}

function isSameClickInteraction(pendingTarget: EventTarget, clickTarget: EventTarget): boolean {
  if (pendingTarget === clickTarget) return true;
  if (!(pendingTarget instanceof Node) || !(clickTarget instanceof Node)) return false;
  return pendingTarget.contains(clickTarget) || clickTarget.contains(pendingTarget);
}

function isRecordableFormControl(
  target: Element | null
): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLSelectElement) &&
    !(target instanceof HTMLTextAreaElement)
  ) {
    return false;
  }

  if (target instanceof HTMLInputElement) {
    const inputType = target.type.toLowerCase();
    return !['button', 'submit', 'reset', 'hidden'].includes(inputType);
  }

  return true;
}

function getAssociatedFormControl(
  target: HTMLElement
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  if (isRecordableFormControl(target)) return target;

  const label = target.closest('label');
  if (!label) return null;

  const nestedControl = label.querySelector('input, select, textarea');
  if (isRecordableFormControl(nestedControl)) return nestedControl;

  const htmlFor = label.getAttribute('for');
  if (!htmlFor) return null;

  const referenced = document.getElementById(htmlFor);
  return isRecordableFormControl(referenced) ? referenced : null;
}

function shouldDeferClickToInputEvent(target: HTMLElement): boolean {
  return Boolean(getAssociatedFormControl(target));
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
    isSameClickInteraction(pending.target, target)
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
  if (!isValidClickTarget(event.target)) return;
  if (shouldDeferClickToInputEvent(event.target)) return;

  beginPointerScreenshot(event.target);
}

async function handleClick(event: MouseEvent): Promise<void> {
  if (!(await isRecordingActive())) return;

  const target = event.target;
  if (!isValidClickTarget(target)) return;
  if (shouldDeferClickToInputEvent(target)) return;

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

async function flushInput(target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): Promise<void> {
  if (!(await isRecordingActive())) return;
  if (isSensitiveField(target)) return;

  const screenshotId = await tryCaptureScreenshotId();
  const viewport = getViewport();
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const element = extractElementSnapshot(target);
  const valuePreview = element.valuePreview ?? target.value ?? '';

  const inputEvent: InputEvent = {
    id: createId(),
    type: 'input',
    timestamp: Date.now(),
    url: location.href,
    title: document.title,
    viewport,
    position: {
      x: centerX,
      y: centerY,
      ...normalizePosition(centerX, centerY, viewport),
    },
    element,
    valuePreview,
    screenshotId,
  };

  await storeEvent(inputEvent);
}

function scheduleInputEvent(target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void {
  const key = target.id || target.name || target.tagName;
  const existing = inputTimers.get(key);
  if (existing) clearTimeout(existing);

  inputTimers.set(
    key,
    setTimeout(() => {
      inputTimers.delete(key);
      void flushInput(target).catch((error) => {
        console.error('[Peacock] Failed to store input event', error);
      });
    }, inputDebounceMs),
  );
}

function handleInput(event: Event): void {
  void (async () => {
    if (!(await isRecordingActive())) return;

    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLTextAreaElement) &&
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }

    if (isPeacockUiElement(target)) return;
    if (isSensitiveField(target)) return;

    scheduleInputEvent(target);
  })();
}

async function captureInitialPageView(): Promise<void> {
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

  updateRecordingUi(recordingState);
  await captureInitialPageView();
}

async function handleNavigation(event: NavigationEvent): Promise<void> {
  if (!(await isRecordingActive())) return;

  if (isSensitiveUrl(event.toUrl)) {
    await sendExtensionMessage({ type: 'PAUSE_RECORDING' });
    await refreshRecordingState();
  }

  await storeEvent(event);
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
    true
  );

  document.addEventListener(
    'click',
    (event) => {
      void handleClick(event).catch((error) => {
        console.error('[Peacock] Failed to store click event', error);
      });
    },
    true
  );

  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleInput, true);

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
    () => recordingState
  );

  initRecordingUi(
    () => {
      void stopRecordingFromUi();
    },
    () => {
      void captureManualPageSnapshot().catch((error) => {
        console.error('[Peacock] Failed to capture page snapshot from badge', error);
      });
    }
  );
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
