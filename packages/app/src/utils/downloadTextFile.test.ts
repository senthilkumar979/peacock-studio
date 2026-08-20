import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadTextFile } from './downloadTextFile';

describe('downloadTextFile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a blob URL, clicks a download anchor, then revokes the URL', () => {
    const click = vi.fn();
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement);

    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    downloadTextFile('hello world', 'notes.txt');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/plain;charset=utf-8');

    expect(createElement).toHaveBeenCalledWith('a');
    const anchor = createElement.mock.results[0]?.value as HTMLAnchorElement;
    expect(anchor.href).toBe('blob:mock-url');
    expect(anchor.download).toBe('notes.txt');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    vi.unstubAllGlobals();
  });
});
