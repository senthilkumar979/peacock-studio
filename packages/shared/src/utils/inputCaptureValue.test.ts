import { describe, expect, it } from 'vitest';
import type { ElementSnapshot } from '../types/events';
import { getInputRawValueFromSource, resolveCapturedInputValue } from './inputCaptureValue';

function baseSnapshot(overrides: Partial<ElementSnapshot> = {}): ElementSnapshot {
  return {
    tagName: 'input',
    type: 'text',
    id: '',
    name: null,
    role: null,
    classes: [],
    selector: '#field',
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
    valuePreview: 'Hello',
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

describe('inputCaptureValue', () => {
  it('returns empty raw value for unchecked checkbox', () => {
    expect(
      getInputRawValueFromSource({
        isContentEditable: false,
        isCheckbox: true,
        isRadio: false,
        checked: false,
        value: 'furniture',
      }),
    ).toBe('');
  });

  it('does not fall back to raw value when checkbox is unchecked', () => {
    const snapshot = baseSnapshot({
      isCheckbox: true,
      isInput: false,
      valuePreview: null,
    });

    expect(resolveCapturedInputValue(snapshot, 'furniture')).toBe('');
  });

  it('uses masked preview for sensitive fields', () => {
    const snapshot = baseSnapshot({
      classification: 'sensitive',
      maskedValue: 'jan***',
      valuePreview: 'jane@example.com',
    });

    expect(resolveCapturedInputValue(snapshot, 'jane@example.com')).toBe('jan***');
  });

  it('reads checked and contenteditable raw values', () => {
    expect(
      getInputRawValueFromSource({
        isContentEditable: false,
        isCheckbox: true,
        isRadio: false,
        checked: true,
      }),
    ).toBe('checked');
    expect(
      getInputRawValueFromSource({
        isContentEditable: true,
        isCheckbox: false,
        isRadio: false,
        innerText: '  Hello  ',
      }),
    ).toBe('Hello');
    expect(
      getInputRawValueFromSource({
        isContentEditable: false,
        isCheckbox: false,
        isRadio: false,
      }),
    ).toBe('');
  });

  it('clears secrets and resolves checked values', () => {
    expect(resolveCapturedInputValue(baseSnapshot({ classification: 'secret' }), 'x')).toBe('');
    expect(
      resolveCapturedInputValue(
        baseSnapshot({
          isCheckbox: true,
          isInput: false,
          valuePreview: 'on',
        }),
        'checked',
      ),
    ).toBe('on');
    expect(resolveCapturedInputValue(baseSnapshot({ valuePreview: null }), 'fallback')).toBe(
      'fallback',
    );
  });
});
