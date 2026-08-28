import { blobToDataUrl } from '@peacock/shared';

function loadImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Could not read screenshot dimensions.'));
    image.src = src;
  });
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not load screenshot.');
  return blobToDataUrl(await response.blob());
}

export async function materializeImageDataUrl(url: string): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  const dataUrl = url.startsWith('data:') ? url : await fetchAsDataUrl(url);
  const size = await loadImageSize(dataUrl);
  return { dataUrl, width: size.width, height: size.height };
}
