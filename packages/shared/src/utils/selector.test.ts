import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUniqueSelector } from './selector';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('getUniqueSelector', () => {
  it('prefers id selectors', () => {
    document.body.innerHTML = '<button id="save-btn">Save</button>';
    expect(getUniqueSelector(document.getElementById('save-btn')!)).toBe('#save-btn');
  });

  it('escapes ids when CSS.escape is unavailable', () => {
    vi.stubGlobal('CSS', undefined);
    document.body.innerHTML = '<div id="a.b:c"></div>';
    expect(getUniqueSelector(document.getElementById('a.b:c')!)).toBe('#a\\.b\\:c');
  });

  it('uses data-testid when present', () => {
    document.body.innerHTML = '<button data-testid="submit">Go</button>';
    const el = document.querySelector('[data-testid="submit"]')!;
    expect(getUniqueSelector(el)).toBe('[data-testid="submit"]');
  });

  it('falls back to nth-of-type path', () => {
    document.body.innerHTML = `
      <div>
        <span>a</span>
        <span>b</span>
      </div>
    `;
    const target = document.querySelector('div > span:last-child')!;
    expect(getUniqueSelector(target)).toBe(
      'body:nth-of-type(1) > div:nth-of-type(1) > span:nth-of-type(2)',
    );
  });
});
