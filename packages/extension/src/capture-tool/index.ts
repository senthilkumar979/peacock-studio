const CAPTURE_TOOL_KEY = '__peacockCaptureToolInitialized';
const SELECTION_OVERLAY_ID = 'peacock-selection-overlay';
const CAPTURE_PREP_STYLE_ID = 'peacock-capture-style';

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

async function scrollToCapturePosition(top: number): Promise<{ scrollY: number }> {
  ensureCapturePrepStyle();
  window.scrollTo({ left: 0, top, behavior: 'auto' });
  await waitForPaint(3);
  await new Promise((resolve) => window.setTimeout(resolve, 80));
  return { scrollY: window.scrollY };
}

async function restorePagePosition(scrollX: number, scrollY: number): Promise<void> {
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
