import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText } from 'lucide-react';
import { FlowStatusBadge } from './FlowStatusBadge';
import { FlowVersionBadge } from './FlowVersionBadge';
import { FlowStepCountBadge } from './FlowStepCountBadge';
import { ViewModeToggle } from './ViewModeToggle';
import { DeleteDocumentConfirmContent } from './DeleteDocumentConfirmContent';
import { DeleteProductTourConfirmContent } from './DeleteProductTourConfirmContent';
import { LibraryEmptyCta } from './LibraryEmptyCta';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('dashboard badges and empty states', () => {
  it('FlowStatusBadge shows live and draft', () => {
    const { rerender } = render(<FlowStatusBadge status="live" />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    rerender(<FlowStatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('FlowVersionBadge handles empty and set versions', () => {
    const { rerender } = render(<FlowVersionBadge version="  " />);
    expect(screen.getByText('Unversioned')).toBeInTheDocument();
    rerender(<FlowVersionBadge version="1.2.0" />);
    expect(screen.getByText('1.2.0')).toBeInTheDocument();
  });

  it('FlowStepCountBadge pluralizes', () => {
    const { rerender } = render(<FlowStepCountBadge stepCount={1} />);
    expect(screen.getByText('1 step')).toBeInTheDocument();
    rerender(<FlowStepCountBadge stepCount={3} />);
    expect(screen.getByText('3 steps')).toBeInTheDocument();
  });

  it('ViewModeToggle calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ViewModeToggle value="table" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /cards/i }));
    expect(onChange).toHaveBeenCalledWith('card');
  });

  it('delete confirm contents show titles and counts', () => {
    render(<DeleteDocumentConfirmContent title="Payroll" stepCount={2} />);
    expect(screen.getByText('Payroll')).toBeInTheDocument();
    expect(screen.getAllByText(/2 steps/).length).toBeGreaterThan(0);

    render(
      <DeleteProductTourConfirmContent title="Onboarding" featureCount={1} demoCount={2} />,
    );
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('1 feature')).toBeInTheDocument();
    expect(screen.getByText('2 demos')).toBeInTheDocument();
  });

  it('LibraryEmptyCta renders primary link', () => {
    renderWithProviders(
      <LibraryEmptyCta
        icon={FileText}
        title="No tours"
        description="Create one"
        primaryHref="/tours/new"
        primaryLabel="Create tour"
      />,
    );
    expect(screen.getByRole('heading', { name: 'No tours' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create tour' })).toHaveAttribute(
      'href',
      '/tours/new',
    );
  });
});
