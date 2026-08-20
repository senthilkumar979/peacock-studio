import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../storage/db';

vi.mock('../utils/blobToDataUrl', () => ({
  blobToDataUrl: vi.fn(async () => 'data:image/png;base64,dGVzdA=='),
}));

import { buildCaptureResultHandoff } from './captureHandoff';

describe('buildCaptureResultHandoff', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({
        width: 320,
        height: 200,
        close: vi.fn(),
      })),
    );
  });

  it('returns an error when capture is missing', async () => {
    await expect(buildCaptureResultHandoff('missing')).resolves.toEqual({
      ok: false,
      error: 'Capture not found or expired. Take a new screenshot from the extension.',
    });
  });

  it('returns image metadata for a stored capture', async () => {
    await db.captures.put({
      id: 'cap-1',
      blob: new Blob(['png'], { type: 'image/png' }),
      mode: 'selection',
      createdAt: 1,
    });

    const result = await buildCaptureResultHandoff('cap-1');
    expect(result).toMatchObject({
      ok: true,
      captureId: 'cap-1',
      mode: 'selection',
      naturalWidth: 320,
      naturalHeight: 200,
    });
    if (result.ok) {
      expect(result.imageDataUrl).toBe('data:image/png;base64,dGVzdA==');
    }
  });
});
