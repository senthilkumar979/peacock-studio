import { describe, expect, it, vi } from 'vitest';
import {
  hasSensitiveAutocomplete,
  isNonRecordableInput,
  isSensitiveField,
  maskSensitiveValue,
  maskValue,
  shouldCaptureInnerHtml,
} from './masking';

describe('masking helpers', () => {
  it('matches sensitive autocomplete tokens inside compound values', () => {
    document.body.innerHTML = '<input autocomplete="billing cc-number" />';
    const input = document.querySelector('input') as HTMLInputElement;

    expect(hasSensitiveAutocomplete(input)).toBe(true);
  });

  it('excludes file inputs from recording', () => {
    document.body.innerHTML = '<input type="file" />';
    const input = document.querySelector('input') as HTMLInputElement;

    expect(isNonRecordableInput(input)).toBe(true);
  });

  it('detects sensitive fields by type and name', () => {
    document.body.innerHTML = '<div id="plain">x</div><input type="password" /><input name="ssn" />';
    expect(isSensitiveField(document.getElementById('plain') as HTMLElement)).toBe(false);
    expect(isSensitiveField(document.querySelector('input[type="password"]') as HTMLElement)).toBe(
      true,
    );
    expect(isSensitiveField(document.querySelector('input[name="ssn"]') as HTMLElement)).toBe(true);
  });

  it('masks values according to policy helpers', () => {
    expect(maskValue('')).toBe('');
    expect(maskValue('Jonathan')).toBe('Jonathan');
    expect(maskSensitiveValue('')).toBe('');
    expect(maskSensitiveValue('ab')).toBe('***');
    expect(maskSensitiveValue('abcd')).toBe('abc***');
  });

  it('only captures short, non-sensitive inner HTML', () => {
    expect(shouldCaptureInnerHtml(document.createElement('div'), '<option>A</option>')).toBe(true);
    expect(shouldCaptureInnerHtml(document.createElement('div'), 'x'.repeat(501))).toBe(false);
    expect(shouldCaptureInnerHtml(document.createElement('div'), '<input type="password">')).toBe(
      false,
    );
    expect(shouldCaptureInnerHtml(document.createElement('script'), '<script>')).toBe(false);
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    expect(shouldCaptureInnerHtml(editable, 'hi')).toBe(false);
  });

  it('returns short values unchanged when masking is enabled via spy', async () => {
    vi.resetModules();
    vi.doMock('../constants/privacy', () => ({ ENABLE_VALUE_MASKING: true }));
    const { maskValue: masked } = await import('./masking');
    expect(masked('ab')).toBe('***');
    expect(masked('abcd')).toBe('abc***');
    vi.doUnmock('../constants/privacy');
    vi.resetModules();
  });
});
