import { describe, expect, it } from 'vitest';
import { hasSensitiveAutocomplete, isNonRecordableInput } from './masking';

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
});
