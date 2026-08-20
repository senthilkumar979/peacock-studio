import { describe, expect, it, vi } from 'vitest';
import {
  buildScreenshotStoragePath,
  dataUrlToBlob,
  inlineScreenshotToBlob,
  isInlineScreenshotUrl,
  sha256HexFromBlob,
} from './screenshotUtils';

describe('screenshotUtils', () => {
  it('sha256HexFromBlob returns hex digest', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const hex = await sha256HexFromBlob(blob);
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
  });

  it('dataUrlToBlob parses mime and payload', () => {
    const blob = dataUrlToBlob('data:image/jpeg;base64,aGVsbG8=');
    expect(blob.type).toBe('image/jpeg');
    expect(blob.size).toBe(5);
  });

  it('dataUrlToBlob throws on invalid url and defaults mime', () => {
    expect(() => dataUrlToBlob('not-a-data-url')).toThrow(/Invalid data URL/);
    // No `;` after the media type → regex miss → default image/png
    const blob = dataUrlToBlob('data:base64,YQ==');
    expect(blob.type).toBe('image/png');
  });

  it('isInlineScreenshotUrl detects data and blob urls', () => {
    expect(isInlineScreenshotUrl('data:image/png;base64,xx')).toBe(true);
    expect(isInlineScreenshotUrl('blob:https://x/1')).toBe(true);
    expect(isInlineScreenshotUrl('https://cdn/x.png')).toBe(false);
  });

  it('buildScreenshotStoragePath joins org/doc/id', () => {
    expect(buildScreenshotStoragePath('org', 'doc', 'shot')).toBe('org/doc/shot.png');
  });

  it('inlineScreenshotToBlob handles data, blob ok/fail, and other urls', async () => {
    await expect(inlineScreenshotToBlob('data:image/png;base64,YQ==')).resolves.toBeInstanceOf(Blob);
    await expect(inlineScreenshotToBlob('https://x')).resolves.toBeNull();
    await expect(inlineScreenshotToBlob('data:bad')).resolves.toBeNull();

    const ok = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x']),
    } as Response);
    await expect(inlineScreenshotToBlob('blob:local')).resolves.toBeInstanceOf(Blob);
    ok.mockRestore();

    const bad = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
    await expect(inlineScreenshotToBlob('blob:local')).resolves.toBeNull();
    bad.mockRestore();

    const boom = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('net'));
    await expect(inlineScreenshotToBlob('blob:local')).resolves.toBeNull();
    boom.mockRestore();
  });
});
