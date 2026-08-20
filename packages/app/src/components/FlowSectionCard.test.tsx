import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowSectionCard } from './FlowSectionCard';
import { FlowSectionPlayerBody } from './FlowSectionPlayerBody';

const section = {
  id: 'sec-1',
  kind: 'section' as const,
  title: 'Getting started',
  description: 'Install the extension and capture a flow.',
};

describe('FlowSectionCard', () => {
  it('renders document variant with description and chapter index', () => {
    render(<FlowSectionCard section={section} variant="document" sectionIndex={0} isActive />);
    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Getting started' })).toBeInTheDocument();
    expect(screen.getByText(section.description)).toBeInTheDocument();
  });

  it('renders editor variant placeholder when description empty', () => {
    render(
      <FlowSectionCard
        section={{ ...section, description: '   ' }}
        variant="editor"
        anchorId="chapter-1"
      />,
    );
    expect(screen.getByText('No section description yet.')).toBeInTheDocument();
    expect(document.getElementById('chapter-1')).toBeTruthy();
  });

  it('renders player variant via FlowSectionPlayerBody', () => {
    render(<FlowSectionCard section={section} variant="player" sectionIndex={2} />);
    expect(screen.getByText('Chapter 3')).toBeInTheDocument();
    expect(screen.getByText(/Press/i)).toBeInTheDocument();
  });
});

describe('FlowSectionPlayerBody', () => {
  it('toggles description and empty copy', () => {
    const { rerender } = render(
      <FlowSectionPlayerBody
        section={section}
        sectionLabel="Chapter 1"
        hasDescription
        titleClass="text-2xl"
      />,
    );
    expect(screen.getByText(section.description)).toBeInTheDocument();

    rerender(
      <FlowSectionPlayerBody
        section={{ ...section, description: '' }}
        sectionLabel="Chapter 1"
        hasDescription={false}
        titleClass="text-2xl"
      />,
    );
    expect(screen.getByText('No section description yet.')).toBeInTheDocument();
  });
});
