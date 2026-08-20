import { ListOrdered } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowDetailsStatChip } from './FlowDetailsStatChip';

describe('FlowDetailsStatChip', () => {
  it('renders label and value', () => {
    render(<FlowDetailsStatChip icon={ListOrdered} label="Steps" value="12" />);
    expect(screen.getByText('Steps')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
