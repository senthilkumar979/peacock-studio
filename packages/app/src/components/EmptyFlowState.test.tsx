import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { EmptyFlowState } from './EmptyFlowState';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('EmptyFlowState', () => {
  it('renders title, description, and dashboard link', () => {
    renderWithProviders(
      <EmptyFlowState title="Nothing here" description="Create a flow to get started." />,
    );

    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByText('Create a flow to get started.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toBeInTheDocument();
  });
});
