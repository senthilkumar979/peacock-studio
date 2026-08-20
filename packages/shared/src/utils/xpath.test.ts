import { describe, expect, it } from 'vitest';
import { getXPath } from './xpath';

describe('getXPath', () => {
  it('returns /html for the document element', () => {
    expect(getXPath(document.documentElement)).toBe('/html');
  });

  it('builds indexed path for nested elements', () => {
    document.body.innerHTML = `
      <div>
        <span>one</span>
        <span id="target">two</span>
      </div>
    `;
    const target = document.getElementById('target')!;
    expect(getXPath(target)).toBe('/html[1]/body[1]/div[1]/span[2]');
  });

  it('uses index 1 when there are no same-tag siblings', () => {
    document.body.innerHTML = '<p id="only">hello</p>';
    expect(getXPath(document.getElementById('only')!)).toBe('/html[1]/body[1]/p[1]');
  });
});
