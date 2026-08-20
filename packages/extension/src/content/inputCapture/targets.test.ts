import { describe, expect, it } from 'vitest';
import {
  getAssociatedFormControl,
  isFocusLeavingControl,
  isRecordableFormControl,
  isSensitiveInputTarget,
  resolveInputTarget,
  shouldDeferClickToInputEvent,
} from './targets';

describe('inputCapture/targets', () => {
  it('resolves standard form controls and skips non-recordable inputs', () => {
    const text = document.createElement('input');
    text.type = 'text';
    expect(resolveInputTarget(text)).toBe(text);

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    expect(resolveInputTarget(hidden)).toBeNull();

    const textarea = document.createElement('textarea');
    expect(resolveInputTarget(textarea)).toBe(textarea);

    const select = document.createElement('select');
    expect(resolveInputTarget(select)).toBe(select);
  });

  it('resolves contenteditable and aria textboxes', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    expect(resolveInputTarget(editable)).toBe(editable);

    const textbox = document.createElement('div');
    textbox.setAttribute('role', 'textbox');
    expect(resolveInputTarget(textbox)).toBe(textbox);
  });

  it('resolves combobox nested controls', () => {
    const combo = document.createElement('div');
    combo.setAttribute('role', 'combobox');
    const nested = document.createElement('input');
    nested.type = 'text';
    combo.appendChild(nested);
    expect(resolveInputTarget(combo)).toBe(nested);

    const emptyCombo = document.createElement('div');
    emptyCombo.setAttribute('role', 'combobox');
    expect(resolveInputTarget(emptyCombo)).toBe(emptyCombo);
  });

  it('returns null for unrelated elements', () => {
    expect(resolveInputTarget(document.createElement('span'))).toBeNull();
    expect(resolveInputTarget(null)).toBeNull();
  });

  it('detects recordable form controls', () => {
    const input = document.createElement('input');
    input.type = 'email';
    expect(isRecordableFormControl(input)).toBe(true);

    const file = document.createElement('input');
    file.type = 'file';
    expect(isRecordableFormControl(file)).toBe(false);
    expect(isRecordableFormControl(document.createElement('div'))).toBe(false);

    expect(isRecordableFormControl(document.createElement('select'))).toBe(true);
    expect(isRecordableFormControl(document.createElement('textarea'))).toBe(true);
  });

  it('finds associated controls via label nesting and htmlFor', () => {
    const nestedInput = document.createElement('input');
    nestedInput.type = 'text';
    const label = document.createElement('label');
    label.appendChild(nestedInput);
    expect(getAssociatedFormControl(label)).toBe(nestedInput);
    expect(shouldDeferClickToInputEvent(label)).toBe(true);

    const linked = document.createElement('input');
    linked.id = 'linked-field';
    linked.type = 'text';
    document.body.appendChild(linked);
    const forLabel = document.createElement('label');
    forLabel.setAttribute('for', 'linked-field');
    const span = document.createElement('span');
    forLabel.appendChild(span);
    document.body.appendChild(forLabel);
    expect(getAssociatedFormControl(span)).toBe(linked);

    expect(getAssociatedFormControl(document.createElement('div'))).toBeNull();
  });

  it('detects sensitive input targets', () => {
    const password = document.createElement('input');
    password.type = 'password';
    expect(isSensitiveInputTarget(password)).toBe(true);

    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    expect(isSensitiveInputTarget(editable)).toBe(false);

    const select = document.createElement('select');
    expect(isSensitiveInputTarget(select)).toBe(false);
  });

  it('detects focus leaving a control', () => {
    const control = document.createElement('div');
    const inside = document.createElement('span');
    control.appendChild(inside);
    const outside = document.createElement('button');

    expect(isFocusLeavingControl(control, null)).toBe(true);
    expect(isFocusLeavingControl(control, inside)).toBe(false);
    expect(isFocusLeavingControl(control, outside)).toBe(true);
  });
});
