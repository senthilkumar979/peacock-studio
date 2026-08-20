import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowStep } from '@peacock/shared';
import { Canvas } from './Canvas';

const step: FlowStep = {
  id: 'step-1',
  title: 'Open dashboard',
  notes: 'Notes',
  generatedTitle: 'Open dashboard',
  generatedDescription: 'Generated description',
  screenshotId: 'shot-1',
  event: {
    id: 'ev',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com/app',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'shot-1',
  },
};

const state = {
  screenshotUrls: { 'shot-1': 'blob:shot' },
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof state) => unknown) => selector(state)),
  getStepScreenshotUrl: (flowStep: FlowStep, urls: Record<string, string>) =>
    urls[flowStep.screenshotId] ?? null,
}));

vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Canvas', () => {
  it('shows empty state when no step is selected', () => {
    render(<Canvas step={null} />);
    expect(screen.getByText('Select a step to preview')).toBeInTheDocument();
  });

  it('smoke-renders step preview with screenshot', () => {
    render(<Canvas step={step} />);
    expect(screen.getByRole('heading', { name: 'Open dashboard' })).toBeInTheDocument();
    expect(screen.getByAltText('Open dashboard')).toHaveAttribute('src', 'blob:shot');
    expect(screen.getByText('https://example.com/app')).toBeInTheDocument();
  });
});
