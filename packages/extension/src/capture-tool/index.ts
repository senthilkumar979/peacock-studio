const CAPTURE_TOOL_KEY = '__peacockCaptureToolInitialized';
const SELECTION_OVERLAY_ID = 'peacock-selection-overlay';
const CAPTURE_PREP_STYLE_ID = 'peacock-capture-style';
const SCROLL_SETTLE_DELAY_MS = 1000;

interface SelectionArea {
  left: number;
  top: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface CaptureMetrics {
  fullWidth: number;
  fullHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
}

interface ViewportOverlayResponse {
  count: number;
}

interface TrackedViewportOverlay {
  element: HTMLElement;
  position: 'fixed' | 'sticky';
}

const trackedViewportOverlays: TrackedViewportOverlay[] = [];
const suppressedViewportOverlayStyles = new Map<HTMLElement, string | null>();

function waitForPaint(frames = 2): Promise<void> {
  return new Promise((resolve) => {
    let remaining = frames;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function ensureCapturePrepStyle(): HTMLStyleElement {
  const existing = document.getElementById(CAPTURE_PREP_STYLE_ID) as HTMLStyleElement | null;
  if (existing) return existing;

  const style = document.createElement('style');
  style.id = CAPTURE_PREP_STYLE_ID;
  style.textContent = `
    html, body {
      scroll-behavior: auto !important;
    }
  `;
  document.documentElement.appendChild(style);
  return style;
}

function getCaptureMetrics(): CaptureMetrics {
  const doc = document.documentElement;
  const body = document.body;

  return {
    fullWidth: Math.max(doc.scrollWidth, body?.scrollWidth ?? 0, window.innerWidth),
    fullHeight: Math.max(doc.scrollHeight, body?.scrollHeight ?? 0, window.innerHeight),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };
}

function isElementVisible(element: HTMLElement, rect: DOMRect): boolean {
  const style = window.getComputedStyle(element);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (Number(style.opacity || '1') === 0) return false;
  if (rect.height <= 0) return false;
  if (rect.width <= 0) return false;
  if (rect.bottom <= 0) return false;
  if (rect.right <= 0) return false;
  if (rect.top >= window.innerHeight) return false;
  if (rect.left >= window.innerWidth) return false;
  return true;
}

function isPeacockManagedElement(element: HTMLElement): boolean {
  if (element.id === SELECTION_OVERLAY_ID) return true;
  if (element.id.startsWith('peacock')) return true;
  return Boolean(element.closest('[id^="peacock"]'));
}

function shouldTrackViewportOverlay(element: HTMLElement, rect: DOMRect): boolean {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxEdgeOffsetX = Math.min(96, viewportWidth * 0.12);
  const maxEdgeOffsetY = Math.min(96, viewportHeight * 0.15);
  const topGap = rect.top;
  const bottomGap = viewportHeight - rect.bottom;
  const leftGap = rect.left;
  const rightGap = viewportWidth - rect.right;
  const isTopAnchored = topGap <= maxEdgeOffsetY;
  const isBottomAnchored = bottomGap <= maxEdgeOffsetY;
  const isLeftAnchored = leftGap <= maxEdgeOffsetX;
  const isRightAnchored = rightGap <= maxEdgeOffsetX;
  const widthRatio = rect.width / viewportWidth;
  const heightRatio = rect.height / viewportHeight;
  const isAlmostFullscreen = widthRatio > 0.85 && heightRatio > 0.85;

  if (isAlmostFullscreen) return false;

  const isTopOrBottomBar =
    (isTopAnchored || isBottomAnchored) &&
    widthRatio >= 0.3 &&
    rect.height <= Math.min(260, viewportHeight * 0.4);

  const isSidePanel =
    (isLeftAnchored || isRightAnchored) &&
    heightRatio >= 0.25 &&
    rect.width <= Math.min(420, viewportWidth * 0.45);

  const isCornerWidget =
    ((isBottomAnchored && isRightAnchored) || (isBottomAnchored && isLeftAnchored)) &&
    rect.width <= Math.min(220, viewportWidth * 0.35) &&
    rect.height <= Math.min(220, viewportHeight * 0.35);

  const isFloatingTopWidget =
    ((isTopAnchored && isRightAnchored) || (isTopAnchored && isLeftAnchored)) &&
    rect.width <= Math.min(220, viewportWidth * 0.35) &&
    rect.height <= Math.min(220, viewportHeight * 0.35);

  const isAnchoredStrip =
    (isTopAnchored || isBottomAnchored) &&
    widthRatio >= 0.45 &&
    heightRatio <= 0.45;

  if (!isTopOrBottomBar && !isSidePanel && !isCornerWidget && !isFloatingTopWidget && !isAnchoredStrip) {
    return false;
  }

  if (element.tagName === 'BODY' || element.tagName === 'HTML') return false;
  return true;
}

function discoverViewportOverlays(): ViewportOverlayResponse {
  trackedViewportOverlays.length = 0;

  const candidates = Array.from(document.querySelectorAll<HTMLElement>('body *'))
    .map((element) => {
      if (isPeacockManagedElement(element)) return null;

      const style = window.getComputedStyle(element);
      if (style.position !== 'fixed' && style.position !== 'sticky') return null;

      const rect = element.getBoundingClientRect();
      if (!isElementVisible(element, rect)) return null;
      if (!shouldTrackViewportOverlay(element, rect)) return null;

      return {
        element,
        position: style.position as 'fixed' | 'sticky',
      };
    })
    .filter((candidate): candidate is TrackedViewportOverlay => Boolean(candidate));

  const outermostCandidates = candidates.filter(
    (candidate) =>
      !candidates.some(
        (other) => other !== candidate && other.element.contains(candidate.element)
      )
  );

  trackedViewportOverlays.push(...outermostCandidates);
  return { count: trackedViewportOverlays.length };
}

async function setViewportOverlaysSuppressed(suppressed: boolean): Promise<ViewportOverlayResponse> {
  if (suppressed) {
    for (const overlay of trackedViewportOverlays) {
      const { element, position } = overlay;
      if (!suppressedViewportOverlayStyles.has(element)) {
        suppressedViewportOverlayStyles.set(element, element.getAttribute('style'));
      }

      element.style.setProperty('pointer-events', 'none', 'important');
      element.style.setProperty('transition', 'none', 'important');
      element.style.setProperty('animation', 'none', 'important');

      if (position === 'sticky') {
        element.style.setProperty('position', 'relative', 'important');
        element.style.setProperty('top', 'auto', 'important');
        element.style.setProperty('bottom', 'auto', 'important');
        element.style.setProperty('left', 'auto', 'important');
        element.style.setProperty('right', 'auto', 'important');
        element.style.setProperty('inset', 'auto', 'important');
        continue;
      }

      element.style.setProperty('opacity', '0', 'important');
    }

    await waitForPaint(2);
    return { count: trackedViewportOverlays.length };
  }

  for (const [element, previousStyle] of suppressedViewportOverlayStyles.entries()) {
    if (previousStyle === null) {
      element.removeAttribute('style');
      continue;
    }

    element.setAttribute('style', previousStyle);
  }

  suppressedViewportOverlayStyles.clear();
  await waitForPaint(2);
  return { count: trackedViewportOverlays.length };
}

async function scrollToCapturePosition(top: number): Promise<{ scrollY: number }> {
  ensureCapturePrepStyle();
  window.scrollTo({ left: 0, top, behavior: 'auto' });
  await waitForPaint(3);
  await new Promise((resolve) => window.setTimeout(resolve, SCROLL_SETTLE_DELAY_MS));
  return { scrollY: window.scrollY };
}

async function restorePagePosition(scrollX: number, scrollY: number): Promise<void> {
  await setViewportOverlaysSuppressed(false);
  trackedViewportOverlays.length = 0;
  window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' });
  await waitForPaint(2);
}

function removeSelectionOverlay(): void {
  document.getElementById(SELECTION_OVERLAY_ID)?.remove();
}

function startSelectionCapture(): Promise<SelectionArea | null> {
  removeSelectionOverlay();

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = SELECTION_OVERLAY_ID;
    overlay.style.cssText = [
      'position: fixed',
      'inset: 0',
      'z-index: 2147483647',
      'cursor: crosshair',
      'background: rgba(15, 23, 42, 0.18)',
      'user-select: none',
    ].join(';');

    const hint = document.createElement('div');
    hint.textContent = 'Drag to select an area. Press Esc to cancel.';
    hint.style.cssText = [
      'position: fixed',
      'top: 16px',
      'left: 50%',
      'transform: translateX(-50%)',
      'padding: 10px 14px',
      'border-radius: 999px',
      'background: rgba(15, 23, 42, 0.88)',
      'color: white',
      'font: 12px/1.2 system-ui, sans-serif',
      'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25)',
    ].join(';');

    const box = document.createElement('div');
    box.style.cssText = [
      'position: fixed',
      'border: 2px solid #2563eb',
      'background: transparent',
      'box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.14)',
      'display: none',
      'pointer-events: none',
    ].join(';');

    let startX = 0;
    let startY = 0;
    let selecting = false;

    const cleanup = async (result: SelectionArea | null) => {
      window.removeEventListener('keydown', onKeyDown, true);
      overlay.remove();
      await waitForPaint(2);
      resolve(result);
    };

    const renderBox = (currentX: number, currentY: number) => {
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      box.style.display = 'block';
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!selecting) return;
      renderBox(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!selecting) return;
      selecting = false;
      overlay.releasePointerCapture(event.pointerId);

      const left = Math.min(startX, event.clientX);
      const top = Math.min(startY, event.clientY);
      const width = Math.abs(event.clientX - startX);
      const height = Math.abs(event.clientY - startY);

      if (width < 8 || height < 8) {
        void cleanup(null);
        return;
      }

      void cleanup({
        left,
        top,
        width,
        height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      void cleanup(null);
    };

    overlay.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      selecting = true;
      startX = event.clientX;
      startY = event.clientY;
      overlay.setPointerCapture(event.pointerId);
      renderBox(event.clientX, event.clientY);
    });
    overlay.addEventListener('pointermove', onPointerMove);
    overlay.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown, true);

    overlay.appendChild(hint);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}

const captureToolWindow = window as Window & { [CAPTURE_TOOL_KEY]?: boolean };
if (!captureToolWindow[CAPTURE_TOOL_KEY]) {
  captureToolWindow[CAPTURE_TOOL_KEY] = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'PEACOCK_GET_CAPTURE_METRICS') {
      sendResponse(getCaptureMetrics());
      return;
    }

    if (message?.type === 'PEACOCK_SCROLL_CAPTURE_PAGE') {
      void scrollToCapturePosition(message.top)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }

    if (message?.type === 'PEACOCK_DISCOVER_VIEWPORT_OVERLAYS') {
      sendResponse(discoverViewportOverlays());
      return;
    }

    if (message?.type === 'PEACOCK_SET_VIEWPORT_OVERLAYS_SUPPRESSED') {
      void setViewportOverlaysSuppressed(Boolean(message.suppressed))
        .then(sendResponse)
        .catch((error) => {
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }

    if (message?.type === 'PEACOCK_RESTORE_CAPTURE_PAGE') {
      void restorePagePosition(message.scrollX ?? 0, message.scrollY ?? 0)
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }

    if (message?.type === 'PEACOCK_START_SELECTION_CAPTURE') {
      void startSelectionCapture()
        .then(sendResponse)
        .catch((error) => {
          sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
    }
  });
}
