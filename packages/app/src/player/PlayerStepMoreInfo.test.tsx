import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FlowStep, StepResource } from '@peacock/shared';
import { PlayerStepMoreInfo } from './PlayerStepMoreInfo';

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
];

describe('PlayerStepMoreInfo', () => {
  afterEach(() => {
    cleanup();
  });

  it('hides the button when there is no extra information', () => {
    const { container } = render(<PlayerStepMoreInfo step={step} stepResources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens a drawer with detailed description and resources', async () => {
    const user = userEvent.setup();
    render(
      <PlayerStepMoreInfo
        step={{ ...step, detailedDescription: '<p>More detail</p>' }}
        stepResources={resources}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More info' }));

    const dialog = screen.getByRole('dialog', { name: 'More info' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('More detail')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /docs.example.com\/help/i })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Close more info' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
