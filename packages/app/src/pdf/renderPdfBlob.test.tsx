import { beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = () => void;

function createPdfInstance(options?: { documentReadyImmediately?: boolean; toBlobReject?: Error }) {
  const listeners = new Set<Listener>();
  const container = {
    document: options?.documentReadyImmediately === false ? null : ({ type: 'DOCUMENT' } as object),
  };

  return {
    container,
    on: vi.fn((event: string, listener: Listener) => {
      if (event === 'change') listeners.add(listener);
    }),
    removeListener: vi.fn((event: string, listener: Listener) => {
      if (event === 'change') listeners.delete(listener);
    }),
    updateContainer: vi.fn(() => {
      container.document = { type: 'DOCUMENT' };
      for (const listener of [...listeners]) listener();
    }),
    toBlob: vi.fn(async () => {
      if (options?.toBlobReject) throw options.toBlobReject;
      return new Blob(['pdf'], { type: 'application/pdf' });
    }),
  };
}

const pdf = vi.fn();

vi.mock('@react-pdf/renderer', () => ({
  pdf: (...args: any[]) => (pdf as any)(...args),
}));

import { renderPdfBlob } from './renderPdfBlob';

describe('renderPdfBlob', () => {
  beforeEach(() => {
    pdf.mockReset();
  });

  it('waits for the document container then returns a blob', async () => {
    const instance = createPdfInstance({ documentReadyImmediately: false });
    pdf.mockReturnValue(instance);

    const blob = await renderPdfBlob(<div /> as never);

    expect(instance.updateContainer).toHaveBeenCalled();
    expect(instance.toBlob).toHaveBeenCalled();
    expect(blob).toBeInstanceOf(Blob);
  });

  it('resolves immediately when the container already has a document', async () => {
    const instance = createPdfInstance({ documentReadyImmediately: true });
    pdf.mockReturnValue(instance);

    await renderPdfBlob(<div /> as never);
    expect(instance.toBlob).toHaveBeenCalled();
  });
});
