export async function sha256HexFromBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(',');
  if (!payload) throw new Error('Invalid data URL.');

  const headerPart = header ?? '';
  const mimeMatch = /data:(.*?);/.exec(headerPart);
  const mime = mimeMatch?.[1] ?? 'image/png';
  const normalizedPayload = payload.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalizedPayload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

export async function inlineScreenshotToBlob(url: string): Promise<Blob | null> {
  if (url.startsWith('blob:')) {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  }

  if (!url.startsWith('data:')) return null;

  try {
    return dataUrlToBlob(url);
  } catch {
    return null;
  }
}

export function isInlineScreenshotUrl(url: string): boolean {
  return url.startsWith('data:') || url.startsWith('blob:');
}

export function buildScreenshotStoragePath(
  organizationId: string,
  documentId: string,
  screenshotId: string,
): string {
  return `${organizationId}/${documentId}/${screenshotId}.png`;
}
