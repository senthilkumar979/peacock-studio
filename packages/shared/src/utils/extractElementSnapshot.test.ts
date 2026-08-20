import { describe, expect, it } from 'vitest';
import { extractElementSnapshot } from './extractElementSnapshot';

describe('extractElementSnapshot', () => {
  it('captures button metadata and parent form context', () => {
    document.body.innerHTML = `
      <form id="order-form" name="orderForm">
        <button id="save-btn" name="form-submit" class="btn primary" data-action="save">
          Save &amp; Close
        </button>
      </form>
    `;

    const button = document.querySelector('button') as HTMLButtonElement;
    const snapshot = extractElementSnapshot(button);

    expect(snapshot.tagName).toBe('button');
    expect(snapshot.name).toBe('form-submit');
    expect(snapshot.id).toBe('save-btn');
    expect(snapshot.innerText).toBe('Save & Close');
    expect(snapshot.isButton).toBe(true);
    expect(snapshot.dataAttributes.action).toBe('save');
    expect(snapshot.parent?.tagName).toBe('form');
    expect(snapshot.parent?.name).toBe('orderForm');
    expect(snapshot.selector).toContain('#save-btn');
    expect(snapshot.xpath).toContain('button');
  });

  it('does not capture password field values', () => {
    document.body.innerHTML = `<input type="password" name="user-password" value="secret123" />`;

    const input = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(input);

    expect(snapshot.valuePreview).toBeNull();
    expect(snapshot.type).toBe('password');
  });

  it('captures full input values when masking is disabled', () => {
    document.body.innerHTML = `<input type="text" name="firstName" value="Jonathan" />`;

    const input = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(input);

    expect(snapshot.valuePreview).toBe('Jonathan');
  });

  it('captures select option text', () => {
    document.body.innerHTML = `
      <label for="state-select">State</label>
      <select id="state-select" name="state">
        <option value="tn">Tamil Nadu</option>
        <option value="ka" selected>Karnataka</option>
      </select>
    `;

    const select = document.querySelector('select') as HTMLSelectElement;
    const snapshot = extractElementSnapshot(select);

    expect(snapshot.isSelect).toBe(true);
    expect(snapshot.valuePreview).toBe('Karnataka');
  });

  it('captures icon-only button via aria-label', () => {
    document.body.innerHTML =
      '<button aria-label="Add to cart"><svg><path d="M0 0"/></svg></button>';
    const button = document.querySelector('button') as HTMLButtonElement;
    const snapshot = extractElementSnapshot(button);

    expect(snapshot.isButton).toBe(true);
    expect(snapshot.label.ariaLabel).toBe('Add to cart');
    expect(snapshot.innerText).toBe('');
  });

  it('captures contenteditable text and flags', () => {
    document.body.innerHTML =
      '<div id="editor" contenteditable="true" role="textbox">Hello world</div>';
    const editor = document.querySelector('#editor') as HTMLDivElement;
    const snapshot = extractElementSnapshot(editor);

    expect(snapshot.isContentEditable).toBe(true);
    expect(snapshot.isInput).toBe(true);
    expect(snapshot.valuePreview).toBe('Hello world');
  });

  it('captures aria textbox values without contenteditable', () => {
    document.body.innerHTML = '<div id="notes" role="textbox">Line one</div>';
    const editor = document.querySelector('#notes') as HTMLDivElement;
    const snapshot = extractElementSnapshot(editor);

    expect(snapshot.isInput).toBe(true);
    expect(snapshot.valuePreview).toBe('Line one');
  });

  it('treats input type button as button role', () => {
    document.body.innerHTML = '<input type="button" value="Dismiss" />';
    const input = document.querySelector('input') as HTMLInputElement;
    const snapshot = extractElementSnapshot(input);

    expect(snapshot.isButton).toBe(true);
    expect(snapshot.isInput).toBe(false);
  });

  it('truncates long values and resolves aria-labelledby', () => {
    const long = 'x'.repeat(250);
    document.body.innerHTML = `
      <span id="lbl">${long}</span>
      <button aria-labelledby="lbl missing">Go</button>
    `;
    const snapshot = extractElementSnapshot(document.querySelector('button') as HTMLElement);
    expect(snapshot.label.ariaLabelledBy?.endsWith('…')).toBe(true);
    expect(snapshot.label.ariaLabelledBy!.length).toBeLessThanOrEqual(201);
  });

  it('caps data attributes and returns null labelledby when empty', () => {
    const attrs = Array.from({ length: 25 }, (_, i) => `data-k${i}="${'v'.repeat(120)}"`).join(' ');
    document.body.innerHTML = `<button aria-labelledby="missing" ${attrs}>Go</button>`;
    const snapshot = extractElementSnapshot(document.querySelector('button') as HTMLElement);
    expect(Object.keys(snapshot.dataAttributes).length).toBeLessThanOrEqual(20);
    expect(snapshot.label.ariaLabelledBy).toBeNull();
    expect(Object.values(snapshot.dataAttributes)[0]?.endsWith('…')).toBe(true);
  });
});
