import { beforeEach, describe, expect, it, vi } from 'vitest';

const register = vi.fn();

vi.mock('@react-pdf/renderer', () => ({
  Font: { register: (...args: any[]) => (register as any)(...args) },
}));

vi.mock('@fontsource/lexend/files/lexend-latin-400-normal.woff?url', () => ({
  default: 'lexend-400.woff',
}));
vi.mock('@fontsource/lexend/files/lexend-latin-600-normal.woff?url', () => ({
  default: 'lexend-600.woff',
}));
vi.mock('@fontsource/lexend/files/lexend-latin-700-normal.woff?url', () => ({
  default: 'lexend-700.woff',
}));

describe('registerPdfFonts', () => {
  beforeEach(() => {
    vi.resetModules();
    register.mockClear();
  });

  it('registers Lexend weights once', async () => {
    const { registerPdfFonts } = await import('./registerPdfFonts');
    registerPdfFonts();
    registerPdfFonts();

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith({
      family: 'Lexend',
      fonts: [
        { src: 'lexend-400.woff', fontWeight: 400 },
        { src: 'lexend-600.woff', fontWeight: 600 },
        { src: 'lexend-700.woff', fontWeight: 700 },
      ],
    });
  });
});
