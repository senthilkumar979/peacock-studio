import { describe, expect, it } from 'vitest';
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from './legalContent';

describe('legalContent', () => {
  it('exports privacy sections with headings and body', () => {
    expect(PRIVACY_SECTIONS.length).toBeGreaterThan(0);
    for (const section of PRIVACY_SECTIONS) {
      expect(section.heading.length).toBeGreaterThan(0);
      expect(
        (section.paragraphs?.length ?? 0) + (section.bullets?.length ?? 0),
      ).toBeGreaterThan(0);
    }
  });

  it('exports terms sections with headings and body', () => {
    expect(TERMS_SECTIONS.length).toBeGreaterThan(0);
    for (const section of TERMS_SECTIONS) {
      expect(section.heading.length).toBeGreaterThan(0);
    }
  });
});
