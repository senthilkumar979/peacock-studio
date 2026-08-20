import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionPanel } from './SectionPanel';

const state = {
  updateSectionTitle: vi.fn(),
  updateSectionDescription: vi.fn(),
  deleteOutlineItem: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof state) => unknown) => selector(state)),
}));

describe('SectionPanel', () => {
  it('shows empty state when no section is selected', () => {
    render(<SectionPanel section={null} />);
    expect(screen.getByText('Select a section to edit its details.')).toBeInTheDocument();
  });

  it('smoke-renders section fields', () => {
    render(
      <SectionPanel
        section={{ id: 'sec-1', kind: 'section', title: 'Setup', description: 'Get ready' }}
      />,
    );
    expect(screen.getByText('Chapter / section')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Setup')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Get ready')).toBeInTheDocument();
  });
});
