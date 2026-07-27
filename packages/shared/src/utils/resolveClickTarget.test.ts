import { describe, expect, it } from 'vitest';
import { getEventTargetElement, resolveClickTarget } from './resolveClickTarget';

function createSvgPath(): SVGPathElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.appendChild(path);
  return path;
}

describe('resolveClickTarget', () => {
  it('resolves path inside button > svg to button', () => {
    document.body.innerHTML = '<button aria-label="Add to cart"><svg><path d="M0 0"/></svg></button>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('button'));
  });

  it('resolves path inside a > svg to a', () => {
    document.body.innerHTML = '<a href="/cart"><svg><path d="M0 0"/></svg></a>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('a'));
  });

  it('resolves path inside button > span > svg to button', () => {
    document.body.innerHTML =
      '<button><span class="icon"><svg><path d="M0 0"/></svg></span></button>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('button'));
  });

  it('resolves path inside span > svg to span', () => {
    document.body.innerHTML = '<span class="icon"><svg><path d="M0 0"/></svg></span>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('span'));
  });

  it('resolves path inside div > svg to div', () => {
    document.body.innerHTML = '<div class="icon"><svg><path d="M0 0"/></svg></div>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('div'));
  });

  it('resolves path inside p > svg to p', () => {
    document.body.innerHTML = '<p><svg><path d="M0 0"/></svg></p>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('p'));
  });

  it('resolves path inside label wrapping checkbox to label', () => {
    document.body.innerHTML =
      '<label><input type="checkbox" /><svg><path d="M0 0"/></svg></label>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('label'));
  });

  it('resolves path inside div[role=button] > svg to div', () => {
    document.body.innerHTML =
      '<div role="button" aria-label="Menu"><svg><path d="M0 0"/></svg></div>';
    const path = document.querySelector('path')!;
    expect(resolveClickTarget(path)).toBe(document.querySelector('[role="button"]'));
  });

  it('resolves bare div click', () => {
    document.body.innerHTML = '<div id="target">Click me</div>';
    const div = document.querySelector('div')!;
    expect(resolveClickTarget(div)).toBe(div);
  });

  it('returns null for null target', () => {
    expect(resolveClickTarget(null)).toBeNull();
  });

  it('resolves standalone SVG path via parent wrapper', () => {
    const path = createSvgPath();
    const wrapper = document.createElement('span');
    wrapper.appendChild(path.parentElement!);
    document.body.appendChild(wrapper);

    expect(resolveClickTarget(path)).toBe(wrapper);
  });
});

describe('getEventTargetElement', () => {
  it('returns first Element from composedPath', () => {
    document.body.innerHTML = '<button><svg><path d="M0 0"/></svg></button>';
    const path = document.querySelector('path')!;
    const event = new Event('click', { bubbles: true, composed: true });
    Object.defineProperty(event, 'composedPath', {
      value: () => [path, path.parentElement, document.body, document, window],
    });
    Object.defineProperty(event, 'target', { value: path });

    expect(getEventTargetElement(event)).toBe(path);
  });

  it('falls back to event.target when composedPath is empty', () => {
    document.body.innerHTML = '<button>OK</button>';
    const button = document.querySelector('button')!;
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: button });

    expect(getEventTargetElement(event)).toBe(button);
  });
});

describe('resolveClickTarget shadow DOM', () => {
  it('resolves button inside open shadow root', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Shadow action');
    button.textContent = 'Go';
    shadow.appendChild(button);
    document.body.appendChild(host);

    expect(resolveClickTarget(button)).toBe(button);
  });
});
