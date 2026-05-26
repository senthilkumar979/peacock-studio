import { deleteCaptureResult, getCaptureResult } from '../src/storage/db';

const logoEl = document.getElementById('logo') as HTMLImageElement;
const titleEl = document.getElementById('capture-title') as HTMLHeadingElement;
const subtitleEl = document.getElementById('capture-subtitle') as HTMLParagraphElement;
const statusEl = document.getElementById('capture-status') as HTMLParagraphElement;
const imageEl = document.getElementById('capture-image') as HTMLImageElement;
const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;

logoEl.src = chrome.runtime.getURL('logo.png');

const captureId = new URLSearchParams(window.location.search).get('captureId');
let captureBlob: Blob | null = null;
let imageUrl: string | null = null;

function getModeLabel(mode: string): string {
  if (mode === 'full-page') return 'Full page screenshot';
  if (mode === 'selection') return 'Selection screenshot';
  return 'Visible area screenshot';
}

function setButtonsEnabled(enabled: boolean): void {
  downloadBtn.disabled = !enabled;
  copyBtn.disabled = !enabled;
}

async function loadCapture(): Promise<void> {
  if (!captureId) {
    titleEl.textContent = 'Screenshot not found';
    subtitleEl.textContent = 'No capture id was provided.';
    statusEl.textContent = 'Open a screenshot from the extension popup.';
    return;
  }

  const capture = await getCaptureResult(captureId);
  if (!capture) {
    titleEl.textContent = 'Screenshot not found';
    subtitleEl.textContent = 'This capture may have expired or been removed.';
    statusEl.textContent = 'Take a new screenshot from the extension popup.';
    return;
  }

  captureBlob = capture.blob;
  imageUrl = URL.createObjectURL(capture.blob);
  imageEl.src = imageUrl;
  imageEl.hidden = false;

  titleEl.textContent = getModeLabel(capture.mode);
  subtitleEl.textContent = 'Review the screenshot below, then download it or copy it to your clipboard.';
  statusEl.textContent = 'Screenshot ready.';
  setButtonsEnabled(true);

  await deleteCaptureResult(capture.id).catch(() => {});
}

downloadBtn.addEventListener('click', () => {
  if (!captureBlob || !imageUrl) return;
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `peacock-${Date.now()}.png`;
  link.click();
});

copyBtn.addEventListener('click', async () => {
  if (!captureBlob) return;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [captureBlob.type || 'image/png']: captureBlob,
      }),
    ]);
    statusEl.textContent = 'Copied to clipboard.';
  } catch (error) {
    statusEl.textContent =
      error instanceof Error ? `Copy failed: ${error.message}` : 'Copy failed.';
  }
});

window.addEventListener('beforeunload', () => {
  if (imageUrl) URL.revokeObjectURL(imageUrl);
});

setButtonsEnabled(false);
void loadCapture();
