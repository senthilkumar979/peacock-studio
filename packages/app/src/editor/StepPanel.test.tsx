import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowStep } from '@peacock/shared';
import { StepPanel } from './StepPanel';

const state = {
  updateStepTitle: vi.fn(),
  updateStepNotes: vi.fn(),
  updateStepDetailedDescription: vi.fn(),
  setStepDescriptionHidden: vi.fn(),
  deleteOutlineItem: vi.fn(),
  setStepCustomScreenshot: vi.fn(),
  resetStepScreenshot: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof state) => unknown) => selector(state)),
}));

vi.mock('@/components/editor/MinimalRichTextEditor', () => ({
  MinimalRichTextEditor: () => <div data-testid="rich-text" />,
}));

vi.mock('@/components/editor/StepResourceEditor', () => ({
  StepResourceEditor: () => <div data-testid="resources" />,
}));

const step: FlowStep = {
  id: 'step-1',
  title: 'Click save',
  notes: 'Do it',
  generatedTitle: 'Click save',
  generatedDescription: 'Generated',
  screenshotId: 'shot-1',
  event: {
    id: 'ev',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'shot-1',
  },
};

describe('StepPanel', () => {
  it('shows empty state when no step is selected', () => {
    render(<StepPanel step={null} />);
    expect(screen.getByText('Select a step to edit details.')).toBeInTheDocument();
  });

  it('smoke-renders step details', () => {
    render(<StepPanel step={step} />);
    expect(screen.getByText('Step details')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Click save')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text')).toBeInTheDocument();
    expect(screen.getByTestId('resources')).toBeInTheDocument();
  });
});
