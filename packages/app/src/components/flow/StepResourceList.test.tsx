import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { StepResource } from '@peacock/shared';
import { StepResourceList } from './StepResourceList';

const resources: StepResource[] = [
  {
    id: 'r1',
    documentId: 'doc',
    stepId: 'step-1',
    url: 'https://docs.example.com/path',
    label: 'Docs Path',
    sortOrder: 0,
    createdAt: 1,
  },
  {
    id: 'r2',
    documentId: 'doc',
    stepId: 'step-1',
    url: 'https://help.example.com/',
    sortOrder: 1,
    createdAt: 2,
  },
];

describe('StepResourceList', () => {
  it('returns null when there are no resources', () => {
    const { container } = render(<StepResourceList resources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders resource links with labels and safe target attrs', () => {
    render(<StepResourceList resources={resources} className="extra" />);

    expect(screen.getByText('Resources')).toBeInTheDocument();
    const first = screen.getByRole('link', { name: /Docs Path/i });
    expect(first).toHaveAttribute('href', 'https://docs.example.com/path');
    expect(first).toHaveAttribute('target', '_blank');
    expect(first).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: /help.example.com/i })).toBeInTheDocument();
  });
});
