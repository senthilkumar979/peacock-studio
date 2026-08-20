import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AppRouteTransition } from './AppRouteTransition';
import { SmoothLoadReveal } from './SmoothLoadReveal';

describe('motion smoke', () => {
  it('AppRouteTransition renders children', () => {
    renderWithProviders(
      <AppRouteTransition>
        <p>Route body</p>
      </AppRouteTransition>,
      { routerEntries: ['/dashboard'] },
    );
    expect(screen.getByText('Route body')).toBeInTheDocument();
  });

  it('SmoothLoadReveal shows loading then children', () => {
    const { rerender } = renderWithProviders(
      <SmoothLoadReveal isLoading loading={<p>Loading…</p>}>
        <p>Ready</p>
      </SmoothLoadReveal>,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    rerender(
      <SmoothLoadReveal isLoading={false} loading={<p>Loading…</p>}>
        <p>Ready</p>
      </SmoothLoadReveal>,
    );
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});
