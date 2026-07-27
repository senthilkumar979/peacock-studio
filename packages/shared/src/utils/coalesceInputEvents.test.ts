import { describe, expect, it } from 'vitest';
import type { InputEvent } from '../types/events';
import { mergeCoalescedInputEvent, shouldCoalesceInputEvents } from './coalesceInputEvents';

function inputEvent(selector: string, valuePreview: string, id = 'step-1'): InputEvent {
  return {
    id,
    type: 'input',
    timestamp: 1,
    url: 'https://example.com/form',
    title: 'Form',
    element: {
      tagName: 'input',
      type: 'text',
      id: 'field',
      name: null,
      role: null,
      classes: [],
      selector,
      xpath: '//input',
      innerText: '',
      innerHTML: null,
      label: {
        text: 'Field',
        htmlFor: 'field',
        ariaLabel: null,
        ariaLabelledBy: null,
        placeholder: null,
      },
      valuePreview,
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
    },
    valuePreview,
    screenshotId: 'shot-1',
  };
}

describe('coalesceInputEvents', () => {
  it('coalesces consecutive input events on the same selector and url', () => {
    const previous = inputEvent('#email', 'hel');
    const incoming = inputEvent('#email', 'hello', 'step-2');

    expect(shouldCoalesceInputEvents(previous, incoming)).toBe(true);
    expect(mergeCoalescedInputEvent(previous, incoming).id).toBe('step-1');
    expect(mergeCoalescedInputEvent(previous, incoming).valuePreview).toBe('hello');
  });

  it('does not coalesce different selectors', () => {
    const previous = inputEvent('#email', 'hello');
    const incoming = inputEvent('#name', 'Jane');

    expect(shouldCoalesceInputEvents(previous, incoming)).toBe(false);
  });
});
