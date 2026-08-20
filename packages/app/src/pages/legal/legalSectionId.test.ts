import { describe, expect, it } from 'vitest';
import { getLegalSectionId } from './legalSectionId';

describe('getLegalSectionId', () => {
  it('slugifies headings', () => {
    expect(getLegalSectionId('What We Collect')).toBe('what-we-collect');
    expect(getLegalSectionId('  Cookies & Tracking  ')).toBe('cookies-tracking');
  });

  it('strips diacritics', () => {
    expect(getLegalSectionId('Café Résumé')).toBe('cafe-resume');
  });
});
