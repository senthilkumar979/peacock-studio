import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { FlowStep, StepResource } from '@peacock/shared';
import { hasPlayerStepExtras, PlayerStepExtras } from './PlayerStepExtras';

const step: FlowStep = {
  id: 'step-1',
  title: 'Open settings',
  notes: 'Click settings',
  generatedTitle: 'Open settings',
  generatedDescription: '',
  screenshotId: 'shot-1',
  event: {
    id: 'ev-1',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'shot-1',
  },
};

const resources: StepResource[] = [
  {
    id: 'r1',
    documentId: 'doc',
    stepId: 'step-1',
    url: 'https://docs.example.com/help',
    sortOrder: 0,
    createdAt: 1,
  },
  {
    id: 'r2',
    documentId: 'doc',
    stepId: 'other',
    url: 'https://docs.example.com/other',
    sortOrder: 0,
    createdAt: 1,
  },
];

describe('PlayerStepExtras', () => {
  afterEach(() => {
    cleanup();
  });

  it('returns null when there is no detailed description and no step resources', () => {
    expect(hasPlayerStepExtras(step, [])).toBe(false);
    const { container } = render(
      <PlayerStepExtras step={step} stepResources={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders detailed description and filtered resources', () => {
    render(
      <PlayerStepExtras
        step={{ ...step, detailedDescription: '<p>More detail</p>' }}
        stepResources={resources}
      />,
    );

    expect(screen.getByText('Detailed description')).toBeInTheDocument();
    expect(screen.getByText('More detail')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /docs.example.com\/help/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /other/i })).not.toBeInTheDocument();
  });

  it('renders resources alone when description is empty', () => {
    expect(hasPlayerStepExtras(step, resources)).toBe(true);
    render(<PlayerStepExtras step={step} stepResources={resources} />);
    expect(screen.queryByText('Detailed description')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /docs.example.com\/help/i })).toBeInTheDocument();
  });
});
