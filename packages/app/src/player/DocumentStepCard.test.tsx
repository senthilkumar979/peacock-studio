import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const sampleStep = {
  id: 'step-1',
  title: 'Click Save',
  notes: '',
  generatedTitle: 'Click Save',
  generatedDescription: 'Click the Save button',
  screenshotId: 'shot-1',
  event: { type: 'click', timestamp: 0, x: 0.5, y: 0.4, selectors: [], boundingRect: { x: 0, y: 0, width: 0.1, height: 0.1 }, tagName: 'button', attributes: {}, url: 'https://example.com' } as never,
};

vi.mock('@/hooks/usePlayerStepDetailsVisibility', () => ({
  usePlayerStepDetailsVisibility: () => ({
    isDetailsVisible: false,
    toggleDetails: vi.fn(),
  }),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: { stepResources: never[] }) => unknown) =>
    selector({ stepResources: [] }),
  getStepScreenshotUrl: () => null,
}));

vi.mock('@/components/editor/RichTextContent', () => ({
  RichTextContent: ({ html }: { html: string }) => <div>{html}</div>,
}));

vi.mock('@/components/flow/StepResourceList', () => ({
  StepResourceList: () => null,
}));

vi.mock('./BrowserMockup', () => ({
  BrowserMockup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./PlayerClickMarker', () => ({ PlayerClickMarker: () => null }));

import { DocumentStepCard } from './DocumentStepCard';

describe('DocumentStepCard', () => {
  it('renders step title and number', () => {
    render(
      <MemoryRouter>
        <DocumentStepCard
          documentId="doc-1"
          step={sampleStep}
          stepNumber={1}
          anchorId="step-1"
          isActive
          screenshotUrls={{}}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/click save/i)).toBeInTheDocument();
  });
});
