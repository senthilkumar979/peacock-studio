import { describe, expect, it } from 'vitest';
import type { FlowStep } from '../../types/events';
import { generatePlaywrightSpec } from './generatePlaywrightSpec';

function inputStep(valuePreview: string): FlowStep {
  return {
    id: 'step-1',
    title: '',
    notes: '',
    generatedTitle: 'Enter hello in Email',
    generatedDescription: '',
    screenshotId: 'shot-1',
    event: {
      id: 'event-1',
      type: 'input',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Form',
      element: {
        tagName: 'input',
        type: 'text',
        id: 'email',
        name: 'email',
        role: null,
        classes: [],
        selector: '#email',
        xpath: '//input',
        innerText: '',
        innerHTML: null,
        label: {
          text: 'Email',
          htmlFor: 'email',
          ariaLabel: null,
          ariaLabelledBy: null,
          placeholder: null,
        },
        valuePreview: 'old-snapshot-value',
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
    },
  };
}

describe('generatePlaywrightSpec', () => {
  it('uses event.valuePreview for fill statements', () => {
    const spec = generatePlaywrightSpec('Flow', [inputStep('hello')]);
    expect(spec).toContain(".fill('hello')");
    expect(spec).not.toContain('old-snapshot-value');
  });
});
