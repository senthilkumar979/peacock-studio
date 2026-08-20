import { describe, expect, it } from 'vitest';
import { isEditorHintActive, isPageHintActive } from './editorHintControl';
import type { PageHintControl } from './editorHintControl';

describe('editorHintControl re-exports', () => {
  const hints: PageHintControl = {
    activeHintId: 'hint-a',
    hintStep: () => '1 of 2',
    dismissHint: () => undefined,
  };

  it('isPageHintActive matches the active hint id', () => {
    expect(isPageHintActive(hints, 'hint-a')).toBe(true);
    expect(isPageHintActive(hints, 'hint-b')).toBe(false);
    expect(isPageHintActive(undefined, 'hint-a')).toBe(false);
  });

  it('isEditorHintActive aliases isPageHintActive', () => {
    expect(isEditorHintActive).toBe(isPageHintActive);
    expect(isEditorHintActive(hints, 'hint-a')).toBe(true);
  });
});
