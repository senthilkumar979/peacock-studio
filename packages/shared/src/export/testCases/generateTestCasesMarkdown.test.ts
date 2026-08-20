import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem } from '../../types/events';
import { generateTestCasesMarkdown } from './generateTestCasesMarkdown';

const clickElement = {
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
    text: 'Go',
    htmlFor: null,
    ariaLabel: null,
    ariaLabelledBy: null,
    placeholder: null,
  },
  valuePreview: null,
  classification: 'public' as const,
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
};

describe('generateTestCasesMarkdown', () => {
  it('emits empty notice when there are no playable steps', () => {
    const md = generateTestCasesMarkdown('  ', []);
    expect(md).toContain('# Test cases: Untitled flow');
    expect(md).toContain('_No playable steps found in this flow._');
  });

  it('builds main-path and branch cases', () => {
    const outline: FlowOutlineItem[] = [
      { id: 'sec-1', kind: 'section', title: '  ', description: '' },
      {
        id: 'step-1',
        title: 'Manual|title',
        notes: '',
        generatedTitle: '',
        generatedDescription: '',
        screenshotId: 'shot-1',
        event: {
          id: 'ev-1',
          type: 'click',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Home',
          viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
          position: { x: 0.5, y: 0.5, xPercent: 50, yPercent: 50 },
          element: clickElement,
          screenshotId: 'shot-1',
        },
      },
      {
        id: 'step-empty',
        title: '  ',
        notes: '',
        generatedTitle: '  ',
        generatedDescription: '',
        hideDescription: true,
        screenshotId: 'shot-2',
        event: {
          id: 'ev-2',
          type: 'page-view',
          timestamp: 2,
          url: 'https://example.com/2',
          title: 'Two',
          viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
          screenshotId: 'shot-2',
        },
      },
      {
        id: 'branch-1',
        kind: 'branch',
        title: '  ',
        description: '',
        paths: [
          {
            id: 'path-1',
            label: '  ',
            targetDocumentId: 'doc-b',
            targetTitle: '  ',
            targetDescription: '',
            fromStepId: 'step-1',
            toStepId: 'step-1',
            order: 0,
          },
          {
            id: 'path-2',
            label: 'Pro',
            targetDocumentId: 'doc-c',
            targetTitle: 'Pro flow',
            targetDescription: '',
            fromStepId: 'step-1',
            toStepId: 'step-1',
            order: 1,
          },
        ],
      },
    ];

    const md = generateTestCasesMarkdown('Checkout', outline);
    expect(md).toContain('## TC-001 — Main path');
    expect(md).toContain('**Section:** Section');
    expect(md).toContain('Manual\\|title');
    expect(md).toContain('| 2 | Step 2 |');
    expect(md).toContain('## TC-002 — Branch: Path');
    expect(md).toContain('**Linked flow:** Pro flow');
    expect(md).toContain('## TC-003 — Branch: Pro');
  });
});
