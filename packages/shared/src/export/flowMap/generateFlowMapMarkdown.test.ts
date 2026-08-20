import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem } from '../../types/events';
import { generateFlowMapMarkdown } from './generateFlowMapMarkdown';

const outline: FlowOutlineItem[] = [
  { id: 'sec-1', kind: 'section', title: 'Setup "start"', description: '' },
  {
    id: 'branch-1',
    kind: 'branch',
    title: 'Choose',
    description: '',
    paths: [
      {
        id: 'path-1',
        label: 'Free "plan"',
        targetDocumentId: 'doc-b',
        targetTitle: 'Free',
        targetDescription: '',
        fromStepId: 'step-1',
        toStepId: 'step-1',
        order: 0,
      },
    ],
  },
  {
    id: 'step-1',
    title: '',
    notes: '',
    generatedTitle: 'Open app',
    generatedDescription: 'Opens home',
    screenshotId: 'shot-1',
    event: {
      id: 'ev-1',
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Home',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-1',
    },
  },
];

describe('generateFlowMapMarkdown', () => {
  it('renders mermaid nodes and labeled edges', () => {
    const md = generateFlowMapMarkdown('Demo flow', outline);

    expect(md).toContain('# Flow map');
    expect(md).toContain('```mermaid');
    expect(md).toContain('flowchart TD');
    expect(md).toContain('section-sec-1[/"Setup start"/]');
    expect(md).toContain('branch-branch-1{{"Choose"}}');
    expect(md).toContain('path-path-1(["Free plan"])');
    expect(md).toContain('step-step-1["Open app"]');
    expect(md).toContain("-->|Free 'plan'|");
  });
});
