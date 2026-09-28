import { copyImageBlobToClipboard } from '@peacock/shared';

export async function downloadCaptureBlob(blob: Blob, filenamePrefix = 'peacock-capture'): Promise<void> {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenamePrefix}-${Date.now()}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyCaptureBlobToClipboard(blob: Blob): Promise<void> {
  await copyImageBlobToClipboard(blob);
}
