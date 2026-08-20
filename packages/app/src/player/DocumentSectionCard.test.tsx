import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentSectionCard } from './DocumentSectionCard';

vi.mock('@/components/FlowSectionCard', () => ({
  FlowSectionCard: (props: { section: { title: string }; variant: string }) => (
    <div data-testid="section-card">
      {props.section.title} ({props.variant})
    </div>
  ),
}));

describe('DocumentSectionCard', () => {
  it('forwards props to FlowSectionCard', () => {
    render(
      <DocumentSectionCard
        section={{ id: 'sec-1', kind: 'section', title: 'Setup', description: '' }}
        anchorId="section-sec-1"
        isActive
        sectionIndex={0}
      />,
    );
    expect(screen.getByTestId('section-card')).toHaveTextContent('Setup (document)');
  });
});
