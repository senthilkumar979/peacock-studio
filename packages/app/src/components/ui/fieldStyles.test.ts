import { describe, expect, it } from 'vitest';
import {
  fieldErrorClassName,
  fieldInputClassName,
  fieldTextareaClassName,
} from './fieldStyles';

describe('fieldStyles', () => {
  it('exports non-empty shared class strings', () => {
    expect(fieldInputClassName.length).toBeGreaterThan(0);
    expect(fieldErrorClassName).toContain('border-red-600');
  });

  it('builds textarea styles from the input base', () => {
    expect(fieldTextareaClassName).toContain(fieldInputClassName);
    expect(fieldTextareaClassName).toContain('resize-none');
  });
});
