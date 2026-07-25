import { blobToDataUrl as sharedBlobToDataUrl } from '@peacock/shared';

/** @deprecated Prefer importing blobToDataUrl from @peacock/shared. */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  return sharedBlobToDataUrl(blob);
}
