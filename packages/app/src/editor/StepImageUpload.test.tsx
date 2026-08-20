import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowStep } from '@peacock/shared';
import { StepImageUpload } from './StepImageUpload';

const state = {
  setStepCustomScreenshot: vi.fn(),
  resetStepScreenshot: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof state) => unknown) => selector(state)),
}));

const step: FlowStep = {
  id: 'step-1',
  title: 'Open',
  notes: '',
  generatedTitle: 'Open',
  generatedDescription: '',
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

describe('StepImageUpload', () => {
  it('smoke-renders upload controls', () => {
    render(<StepImageUpload step={step} />);
    expect(screen.getByText('Step image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About step image upload' })).toBeInTheDocument();
  });

  it('shows custom image state and reset when applicable', () => {
    render(
      <StepImageUpload step={{ ...step, customScreenshotId: 'custom-1' }} />,
    );
    expect(screen.getByText('Using a custom image for this step.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset to captured' })).toBeInTheDocument();
  });
});
