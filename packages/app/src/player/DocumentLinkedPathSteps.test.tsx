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

vi.mock('./DocumentStepCard', () => ({
  DocumentStepCard: ({ step }: { step: { title: string } }) => <div>{step.title}</div>,
}));

import { DocumentLinkedPathSteps } from './DocumentLinkedPathSteps';

describe('DocumentLinkedPathSteps', () => {
  it('renders path label and step cards', () => {
    render(
      <MemoryRouter>
        <DocumentLinkedPathSteps
          documentId="doc-1"
          pathId="path-1"
          pathLabel="Alt path"
          steps={[sampleStep]}
          screenshotUrls={{}}
          startStepNumber={1}
          activeItemId={null}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/path: alt path/i)).toBeInTheDocument();
    expect(screen.getByText('Click Save')).toBeInTheDocument();
  });
});
