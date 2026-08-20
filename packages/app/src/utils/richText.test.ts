import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FLOW_DESCRIPTION_MAX_CHARS,
  STEP_DETAILED_DESCRIPTION_MAX_CHARS,
  isEmptyRichText,
  normalizeRichText,
  richTextPlainLength,
  sanitizeRichHtml,
  stripHtmlTags,
} from './richText';

describe('richText', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('stripHtmlTags', () => {
    it('returns empty string for empty input', () => {
      expect(stripHtmlTags('')).toBe('');
    });

    it('converts structural tags to newlines and decodes entities', () => {
      const plain = stripHtmlTags(
        '<p>Hello&nbsp;world</p><ul><li>One&amp;two</li></ul><br/><hr/><h2>Title</h2><b>&lt;x&gt;</b>&quot;y&quot;',
      );
      expect(plain).toContain('Hello world');
      expect(plain).toContain('One&two');
      expect(plain).toContain('Title');
      expect(plain).toContain('<x>');
      expect(plain).toContain('"y"');
      expect(plain.includes('<p>') || plain.includes('<ul>')).toBe(false);
    });

    it('collapses excessive newlines', () => {
      expect(stripHtmlTags('<p>a</p><p></p><p></p><p>b</p>')).toBe('a\n\nb');
    });
  });

  describe('richTextPlainLength / isEmptyRichText / normalizeRichText', () => {
    it('counts plain text only', () => {
      expect(richTextPlainLength('<p><strong>Hi</strong></p>')).toBe(2);
      expect(FLOW_DESCRIPTION_MAX_CHARS).toBe(500);
      expect(STEP_DETAILED_DESCRIPTION_MAX_CHARS).toBe(3000);
    });

    it('treats tag-only HTML as empty and normalizes to empty string', () => {
      expect(isEmptyRichText('<p><br></p>')).toBe(true);
      expect(normalizeRichText('  <p></p>  ')).toBe('');
    });

    it('trims non-empty rich text', () => {
      expect(normalizeRichText('  <p>Keep</p>  ')).toBe('<p>Keep</p>');
    });
  });

  describe('sanitizeRichHtml', () => {
    it('returns empty when html is empty', () => {
      expect(sanitizeRichHtml('')).toBe('');
    });

    it('returns empty when DOMParser is unavailable', () => {
      vi.stubGlobal('DOMParser', undefined);
      expect(sanitizeRichHtml('<p>x</p>')).toBe('');
    });

    it('keeps allowlisted tags and strips disallowed wrappers/attrs via recreate', () => {
      const cleaned = sanitizeRichHtml(
        '<div onclick="alert(1)"><p>Safe <strong>bold</strong> <em>em</em> <u>u</u></p>' +
          '<script>evil()</script><h1>H1</h1><h2>H2</h2><h3>H3</h3>' +
          '<ul><li>A</li></ul><ol><li>B</li></ol><br/><hr/><b>b</b><i>i</i></div>',
      );
      expect(cleaned).toContain('<p>');
      expect(cleaned).toContain('<strong>bold</strong>');
      expect(cleaned).toContain('<em>em</em>');
      expect(cleaned).toContain('<u>u</u>');
      expect(cleaned).toContain('<h1>H1</h1>');
      expect(cleaned).toContain('<h2>H2</h2>');
      expect(cleaned).toContain('<h3>H3</h3>');
      expect(cleaned).toContain('<ul>');
      expect(cleaned).toContain('<ol>');
      expect(cleaned).toContain('<br>');
      expect(cleaned).toContain('<hr>');
      expect(cleaned).toContain('<b>b</b>');
      expect(cleaned).toContain('<i>i</i>');
      expect(cleaned).not.toContain('<div');
      expect(cleaned).not.toContain('onclick');
      expect(cleaned).not.toContain('<script');
    });

    it('unwraps unknown elements but keeps text children', () => {
      expect(sanitizeRichHtml('<span>plain</span>')).toBe('plain');
    });

    it('drops non-element nodes such as comments', () => {
      expect(sanitizeRichHtml('<p>a<!-- secret -->b</p>')).toBe('<p>ab</p>');
    });
  });
});
