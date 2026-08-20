import { describe, expect, it } from 'vitest';
import { BRAND_COLORS } from '@/constants/branding';
import { PDF_COLORS, PDF_FONT_FAMILY } from './pdfTheme';

describe('pdfTheme', () => {
  it('uses Lexend and brand primary colors', () => {
    expect(PDF_FONT_FAMILY).toBe('Lexend');
    expect(PDF_COLORS.primary).toBe(BRAND_COLORS.primary);
    expect(PDF_COLORS.instructionBackground).toBe(BRAND_COLORS.primaryMutedBg);
    expect(PDF_COLORS.imageBorder).toMatch(/^#/);
  });
});
