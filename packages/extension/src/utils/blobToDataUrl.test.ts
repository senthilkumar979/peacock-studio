import { describe, expect, it } from 'vitest';
import { blobToDataUrl } from './blobToDataUrl';

describe('blobToDataUrl', () => {
  it('delegates to shared conversion', async () => {
    const blob = new Blob(['peacock'], { type: 'text/plain' });
    const dataUrl = await blobToDataUrl(blob);
    expect(dataUrl).toMatch(/^data:text\/plain;base64,/);
    expect(dataUrl).toContain(btoa('peacock'));
  });
});
