import { describe, expect, it, vi } from 'vitest';
import { ImageTooLargeError } from '@peacock/shared';
import { isAllowedStepImageFile, readStepImageDataUrl } from './stepImageFile';

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    compressImageToMaxBytes: vi.fn(async (file: Blob) => file),
    blobToDataUrl: vi.fn(async () => 'data:image/png;base64,abc'),
    isSvgImageBlob: (file: Blob) => file.type === 'image/svg+xml',
  };
});

function file(name: string, type: string, bytes: Uint8Array | string): File {
  const blobPart =
    typeof bytes === 'string' ? bytes : (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
  return new File([blobPart], name, { type });
}

describe('isAllowedStepImageFile', () => {
  it('requires allowed extension and mime (or empty/octet-stream)', () => {
    expect(isAllowedStepImageFile(file('a.png', 'image/png', new Uint8Array()))).toBe(true);
    expect(isAllowedStepImageFile(file('a.jpg', '', new Uint8Array()))).toBe(true);
    expect(isAllowedStepImageFile(file('a.png', 'application/octet-stream', new Uint8Array()))).toBe(
      true,
    );
    expect(isAllowedStepImageFile(file('a.gif', 'image/gif', new Uint8Array()))).toBe(false);
    expect(isAllowedStepImageFile(file('a.png', 'image/gif', new Uint8Array()))).toBe(false);
  });
});

describe('readStepImageDataUrl', () => {
  it('rejects disallowed file types', async () => {
    await expect(readStepImageDataUrl(file('x.gif', 'image/gif', new Uint8Array()))).rejects.toThrow(
      /Only JPEG/,
    );
  });

  it('rejects files whose content does not match magic bytes', async () => {
    await expect(
      readStepImageDataUrl(file('x.png', 'image/png', new Uint8Array([1, 2, 3, 4]))),
    ).rejects.toThrow(/does not match/);
  });

  it('accepts PNG magic and returns a data URL', async () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    await expect(readStepImageDataUrl(file('ok.png', 'image/png', pngHeader))).resolves.toBe(
      'data:image/png;base64,abc',
    );
  });

  it('accepts SVG text content', async () => {
    await expect(
      readStepImageDataUrl(file('icon.svg', 'image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg"></svg>')),
    ).resolves.toBe('data:image/png;base64,abc');
  });

  it('throws ImageTooLargeError for oversized SVG', async () => {
    const huge = `<svg>${'x'.repeat(6_000_000)}</svg>`;
    await expect(
      readStepImageDataUrl(file('big.svg', 'image/svg+xml', huge)),
    ).rejects.toBeInstanceOf(ImageTooLargeError);
  });
});
