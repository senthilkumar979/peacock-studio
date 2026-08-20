import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const sampleStep = {
  id: 'step-1',
  title: 'Click Save',
  notes: '',
  generatedTitle: 'Click Save',
  generatedDescription: 'Click the Save button',
  screenshotId: 'shot-1',
  event: { type: 'click', timestamp: 0, x: 0.5, y: 0.4, selectors: [], boundingRect: { x: 0, y: 0, width: 0.1, height: 0.1 }, tagName: 'button', attributes: {}, url: 'https://example.com' } as never,
};

vi.mock('@/hooks/useImageLoaded', () => ({
  useImageLoaded: () => ({
    isLoaded: false,
    imgRef: { current: null },
    onLoad: vi.fn(),
    onError: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePlayerStepDetailsVisibility', () => ({
  usePlayerStepDetailsVisibility: () => ({
    isDetailsVisible: true,
    toggleDetails: vi.fn(),
  }),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: { stepResources: never[] }) => unknown) =>
    selector({ stepResources: [] }),
  getStepScreenshotUrl: () => null,
}));

vi.mock('./BrowserMockup', () => ({
  BrowserMockup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('./PlayerClickMarker', () => ({ PlayerClickMarker: () => null }));
vi.mock('./PlayerStepDetailsToggle', () => ({
  PlayerStepDetailsToggle: () => <button type="button">details</button>,
}));
vi.mock('./PlayerStepMoreInfo', () => ({ PlayerStepMoreInfo: () => null }));
vi.mock('./StepDetailPopover', () => ({
  StepDetailPopover: ({ title }: { title: string }) => <div>{title}</div>,
}));

import { PlayerStage } from './PlayerStage';

describe('PlayerStage', () => {
  it('renders stage for a step', () => {
    render(
      <PlayerStage step={sampleStep} stepNumber={1} screenshotUrls={{}} />,
    );
    expect(screen.getByText(/click save/i)).toBeInTheDocument();
  });
});
