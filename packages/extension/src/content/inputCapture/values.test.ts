import { describe, expect, it } from 'vitest';
import type { ElementSnapshot } from '@peacock/shared';
import { getInputRawValue, resolveCapturedValue } from './values';

function snapshot(overrides: Partial<ElementSnapshot> = {}): ElementSnapshot {
  return {
    tagName: 'INPUT',
    type: 'text',
    id: '',
    name: null,
    role: null,
    classes: [],
    selector: 'input',
    xpath: '//input',
    innerText: '',
    innerHTML: null,
    label: {
      text: null,
      htmlFor: null,
      ariaLabel: null,
      ariaLabelledBy: null,
      placeholder: null,
    },
    valuePreview: null,
    classification: 'public',
    maskedValue: null,
    dataAttributes: {},
    ariaDescription: null,
    parent: null,
    grandparent: null,
    isButton: false,
    isLink: false,
    isInput: true,
    isSelect: false,
    isCheckbox: false,
    isRadio: false,
    isOption: false,
    isTab: false,
    isMenuItem: false,
    isCombobox: false,
    isContentEditable: false,
    ...overrides,
  };
}

describe('inputCapture/values', () => {
  it('reads values from inputs, textareas, selects, and contenteditable', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'hello';
    expect(getInputRawValue(input)).toBe('hello');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    expect(getInputRawValue(checkbox)).toBe('checked');

    const textarea = document.createElement('textarea');
    textarea.value = 'notes';
    expect(getInputRawValue(textarea)).toBe('notes');

    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'opt';
    option.selected = true;
    select.appendChild(option);
    expect(getInputRawValue(select)).toBe('opt');

    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerText = 'rich';
    expect(getInputRawValue(editable)).toBe('rich');
  });

  it('resolves captured values through shared masking helpers', () => {
    expect(resolveCapturedValue(snapshot(), 'plain')).toBe('plain');
  });
});
