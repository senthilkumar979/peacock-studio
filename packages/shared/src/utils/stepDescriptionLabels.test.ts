import { describe, expect, it } from 'vitest';
import type { ClickEvent, ElementSnapshot, InputEvent } from '../types/events';
import {
  formatContextSuffix,
  formatPagePrefix,
  getControlKind,
  isInsideForm,
  isSubmitButton,
  resolveStepLabels,
} from './stepDescriptionLabels';

function snapshot(overrides: Partial<ElementSnapshot> = {}): ElementSnapshot {
  return {
    tagName: 'button',
    type: 'button',
    id: '',
    name: null,
    role: null,
    classes: [],
    selector: 'button',
    xpath: '//button',
    innerText: 'Go',
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
    isButton: true,
    isLink: false,
    isInput: false,
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

describe('stepDescriptionLabels helpers', () => {
  it('detects submit buttons for button and input types', () => {
    expect(isSubmitButton(snapshot({ type: 'submit' }))).toBe(true);
    expect(
      isSubmitButton(snapshot({ tagName: 'input', type: 'submit', isButton: true })),
    ).toBe(true);
    expect(isSubmitButton(snapshot({ type: 'button' }))).toBe(false);
  });

  it('detects form ancestry via parent, grandparent, or named wrappers', () => {
    expect(
      isInsideForm(
        snapshot({
          parent: {
            tagName: 'form',
            id: '',
            role: null,
            classes: [],
            name: null,
            text: '',
            dataAttributes: {},
          },
        }),
      ),
    ).toBe(true);

    expect(
      isInsideForm(
        snapshot({
          parent: {
            tagName: 'div',
            id: '',
            role: null,
            classes: [],
            name: null,
            text: '',
            dataAttributes: {},
          },
          grandparent: {
            tagName: 'form',
            id: '',
            role: null,
            classes: [],
            name: null,
            text: '',
            dataAttributes: {},
          },
        }),
      ),
    ).toBe(true);

    expect(
      isInsideForm(
        snapshot({
          parent: {
            tagName: 'div',
            id: '',
            role: null,
            classes: [],
            name: 'wrapper',
            text: '',
            dataAttributes: {},
          },
        }),
      ),
    ).toBe(true);
  });
});

describe('resolveStepLabels', () => {
  it('falls back to generic field label when no candidates exist', () => {
    const element = snapshot({
      isInput: true,
      isButton: false,
      tagName: 'input',
      label: {
        text: null,
        htmlFor: null,
        ariaLabel: null,
        ariaLabelledBy: null,
        placeholder: null,
      },
      name: null,
      id: '',
    });
    const event: InputEvent = {
      id: '1',
      type: 'input',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Form',
      element: element,
      valuePreview: '',
      screenshotId: 'shot',
    };

    expect(resolveStepLabels(element, event).field).toBe('field');
  });

  it('uses recorded value for option labels when visible labels are missing', () => {
    const element = snapshot({
      isRadio: true,
      isInput: false,
      isCheckbox: false,
      isButton: false,
      innerText: '',
      label: {
        text: null,
        htmlFor: null,
        ariaLabel: null,
        ariaLabelledBy: null,
        placeholder: null,
      },
      name: 'plan',
      id: '',
    });
    const event: InputEvent = {
      id: '1',
      type: 'input',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Plans',
      element: element,
      valuePreview: 'pro',
      screenshotId: 'shot',
    };

    expect(resolveStepLabels(element, event).target).toBe('pro');
  });

  it('resolves context hints from data attributes on ancestors', () => {
    const element = snapshot({
      parent: {
        tagName: 'div',
        id: '',
        role: null,
        classes: [],
        name: null,
        text: '',
        dataAttributes: { country: 'India' },
      },
    });
    const event: ClickEvent = {
      id: '1',
      type: 'click',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Checkout',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
      element: element,
      screenshotId: 'shot',
    };

    expect(resolveStepLabels(element, event).contextHint).toBe('Country: India');
    expect(formatPagePrefix('Checkout')).toBe('On the Checkout page, ');
    expect(formatContextSuffix(null)).toBe('');
    expect(formatContextSuffix('Country: India')).toBe(' (Country: India)');
  });
});

describe('getControlKind', () => {
  it('classifies common control kinds', () => {
    expect(getControlKind(snapshot({ isButton: true }))).toBe('button');
    expect(getControlKind(snapshot({ isLink: true, isButton: false }))).toBe('link');
    expect(getControlKind(snapshot({ isSelect: true, isButton: false }))).toBe('select');
    expect(getControlKind(snapshot({ isOption: true, isButton: false }))).toBe('option');
    expect(getControlKind(snapshot({ isCheckbox: true, isButton: false }))).toBe('checkbox');
    expect(getControlKind(snapshot({ isRadio: true, isButton: false }))).toBe('radio');
    expect(getControlKind(snapshot({ isTab: true, isButton: false }))).toBe('tab');
    expect(getControlKind(snapshot({ isMenuItem: true, isButton: false }))).toBe('menuitem');
    expect(getControlKind(snapshot({ isCombobox: true, isButton: false }))).toBe('combobox');
    expect(
      getControlKind(snapshot({ tagName: 'textarea', isInput: false, isButton: false })),
    ).toBe('textarea');
    expect(
      getControlKind(
        snapshot({ isContentEditable: true, isInput: true, isButton: false, tagName: 'div' }),
      ),
    ).toBe('text-input');
    expect(getControlKind(snapshot({ isInput: true, isButton: false }))).toBe('text-input');
    expect(getControlKind(snapshot({ tagName: 'div', isButton: false, isInput: false }))).toBe(
      'generic',
    );
  });
});
