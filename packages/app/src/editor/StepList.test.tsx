import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowStep } from '@peacock/shared';
import { StepList } from './StepList';

const step: FlowStep = {
  id: 'step-1',
  title: 'Open settings',
  notes: '',
  generatedTitle: 'Open settings',
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

const state = {
  steps: [step],
  selectedOutlineId: 'step-1',
  selectOutlineItem: vi.fn(),
  reorderSteps: vi.fn(),
  addManualStep: vi.fn(),
  addSection: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof state) => unknown) => selector(state)),
}));

vi.mock('@/components/onboarding/FirstTimeTooltip', () => ({
  FirstTimeTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('StepList', () => {
  it('smoke-renders outline steps', () => {
    render(<StepList />);
    expect(screen.getByText('Open settings')).toBeInTheDocument();
  });
});
