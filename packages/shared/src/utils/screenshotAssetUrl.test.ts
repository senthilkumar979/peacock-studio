import { describe, expect, it } from 'vitest';
import {
  assertValidScreenshotStoragePath,
  buildAppScreenshotUrl,
  signAppScreenshotUrls,
  signScreenshotAssetToken,
  verifyScreenshotAssetToken,
} from './screenshotAssetUrl';

const PATH =
  '58099025-d900-4141-a1c9-876aba4f6d8b/5cba4004-2551-461f-b895-a1eb1d4a99a9/025b79d9-5102-4a8c-8f47-8a7b12b8ef48.png';
const SECRET = 'test-screenshot-url-secret';

describe('screenshotAssetUrl', () => {
  it('accepts canonical storage paths and rejects invalid ones', () => {
    expect(assertValidScreenshotStoragePath(PATH)).toBe(PATH);
    expect(assertValidScreenshotStoragePath(`/${PATH}`)).toBe(PATH);
    expect(() => assertValidScreenshotStoragePath('not/a/path.png')).toThrow(/Invalid/);
    expect(() => assertValidScreenshotStoragePath(`${PATH}.jpg`)).toThrow(/Invalid/);
    expect(() => assertValidScreenshotStoragePath('../x/y/z.png')).toThrow(/Invalid/);
  });

  it('signs and verifies a round-trip token', async () => {
    const now = 1_700_000_000;
    const token = await signScreenshotAssetToken(PATH, SECRET, 3600, now);
    const verified = await verifyScreenshotAssetToken(token, SECRET, now + 10);

    expect(verified.storagePath).toBe(PATH);
    expect(verified.expiresAt).toBe(now + 3600);
  });

  it('rejects expired, tampered, or wrong-secret tokens', async () => {
    const now = 1_700_000_000;
    const token = await signScreenshotAssetToken(PATH, SECRET, 60, now);

    await expect(verifyScreenshotAssetToken(token, SECRET, now + 61)).rejects.toThrow(/expired/i);
    await expect(verifyScreenshotAssetToken(token, 'other-secret', now)).rejects.toThrow(/signature/i);
    await expect(verifyScreenshotAssetToken(`${token}x`, SECRET, now)).rejects.toThrow();
  });

  it('builds branded app URLs and batch-signs asset maps', async () => {
    const token = await signScreenshotAssetToken(PATH, SECRET, 3600, 1_700_000_000);
    const url = buildAppScreenshotUrl('https://peacockstudio.app/', PATH, token);

    expect(url.startsWith('https://peacockstudio.app/storage/images/')).toBe(true);
    expect(url).toContain(PATH);

    const parsed = new URL(url);
    expect(parsed.pathname).toBe(`/storage/images/${PATH}`);
    expect(parsed.searchParams.get('token')).toBe(token);

    const map = await signAppScreenshotUrls(
      'https://peacockstudio.app',
      [{ id: 'shot-1', storagePath: PATH }],
      SECRET,
      3600,
    );
    expect(map['shot-1']).toMatch(/^https:\/\/peacockstudio\.app\/storage\/images\//);
  });
});
