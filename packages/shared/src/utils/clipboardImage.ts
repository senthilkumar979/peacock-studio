const PNG_MIME_TYPE = 'image/png';

export async function convertImageBlobToPng(blob: Blob): Promise<Blob> {
  if (blob.type === PNG_MIME_TYPE) return blob;

  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create an image conversion canvas.');

    context.drawImage(bitmap, 0, 0);
    return await canvasToPngBlob(canvas);
  } finally {
    bitmap.close();
  }
}

export async function copyImageBlobToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Image clipboard access is not supported in this browser.');
  }

  const pngBlob = convertImageBlobToPng(blob);
  await navigator.clipboard.write([
    new ClipboardItem({
      [PNG_MIME_TYPE]: pngBlob,
    }),
  ]);
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Could not convert the image to PNG.'));
    }, PNG_MIME_TYPE);
  });
}
