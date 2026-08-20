import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import {
  buildFlowDocResourceEntries,
  countResourcesForOutline,
  FlowDocResourcesOverview,
} from './FlowDocResourcesOverview';
import type { FlowOutlineItem, StepResource } from '@peacock/shared';

const step = {
  id: 'step-a',
  event: {
    id: 'ev',
    type: 'page-view' as const,
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 's1',
  },
  title: 'First step',
  notes: '',
  generatedTitle: 'First step',
  generatedDescription: '',
  screenshotId: 's1',
};

const resources: StepResource[] = [
  {
    id: 'r1',
    documentId: 'doc',
    stepId: 'step-a',
    url: 'https://example.com/guide',
    sortOrder: 0,
    createdAt: 1,
  },
];

describe('FlowDocResourcesOverview helpers', () => {
  afterEach(() => {
    cleanup();
  });

  it('builds entries grouped by step', () => {
    const entries = buildFlowDocResourceEntries([step] as FlowOutlineItem[], resources);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.stepTitle).toBe('First step');
    expect(entries[0]?.resources).toHaveLength(1);
  });

  it('skips steps without resources', () => {
    expect(buildFlowDocResourceEntries([step] as FlowOutlineItem[], [])).toEqual([]);
  });

  it('counts resources attached to playable steps', () => {
    expect(countResourcesForOutline([step] as FlowOutlineItem[], resources)).toBe(1);
    expect(
      countResourcesForOutline([step] as FlowOutlineItem[], [
        ...resources,
        { ...resources[0]!, id: 'r2', stepId: 'missing' },
      ]),
    ).toBe(1);
  });

  it('renders resources section or null', () => {
    const { container } = render(
      <FlowDocResourcesOverview documentId="doc" steps={[step] as FlowOutlineItem[]} stepResources={[]} />,
    );
    expect(container).toBeEmptyDOMElement();

    render(
      <FlowDocResourcesOverview
        documentId="doc"
        steps={[step] as FlowOutlineItem[]}
        stepResources={resources}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Step 1: First step/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /example.com\/guide/i })).toBeInTheDocument();
  });
});
