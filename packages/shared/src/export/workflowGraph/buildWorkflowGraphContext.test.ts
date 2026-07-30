import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem } from '../../types/events';
import { buildWorkflowGraphContextMap } from './buildWorkflowGraphContext';

describe('buildWorkflowGraphContextMap', () => {
  it('maps graph node ids to outline items', () => {
    const steps: FlowOutlineItem[] = [
      {
        id: 'section-1',
        kind: 'section',
        title: 'Setup',
        description: '',
      },
      {
        id: 'branch-1',
        kind: 'branch',
        title: 'Choose plan',
        description: '',
        paths: [
          {
            id: 'path-1',
            label: 'Free',
            targetDocumentId: 'doc-b',
            targetTitle: 'Free flow',
            targetDescription: '',
            fromStepId: 'step-1',
            toStepId: 'step-2',
            order: 0,
          },
        ],
      },
      {
        id: 'step-1',
        title: '',
        notes: '',
        generatedTitle: 'Open pricing',
        generatedDescription: '',
        screenshotId: 'shot-1',
        event: {
          id: 'event-1',
          type: 'click',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Pricing',
          viewport: { width: 1280, height: 720, scrollX: 0, scrollY: 0, dpr: 1 },
          position: { x: 0.5, y: 0.5, xPercent: 50, yPercent: 50 },
          element: {
            tagName: 'a',
            type: 'link',
            id: '',
            name: null,
            role: null,
            classes: [],
            selector: 'a',
            xpath: '//a',
            innerText: 'Pricing',
            innerHTML: null,
            label: {
              text: 'Pricing',
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
            isButton: false,
            isLink: true,
            isInput: false,
            isSelect: false,
            isCheckbox: false,
            isRadio: false,
            isOption: false,
            isTab: false,
            isMenuItem: false,
            isCombobox: false,
            isContentEditable: false,
          },
          screenshotId: 'shot-1',
        },
      },
    ];

    const map = buildWorkflowGraphContextMap(steps);
    expect(map.get('root')).toEqual({ kind: 'root' });
    expect(map.get('section-section-1')?.kind).toBe('section');
    expect(map.get('branch-branch-1')?.kind).toBe('branch');
    expect(map.get('path-path-1')?.kind).toBe('path');
    expect(map.get('step-step-1')?.kind).toBe('step');
  });
});
