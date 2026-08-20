import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChunkErrorBoundary, isChunkLoadError } from './ChunkErrorBoundary';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@/utils/appError', () => ({
  logSoftFailure: vi.fn(),
  logAppError: vi.fn(),
}));

describe('isChunkLoadError', () => {
  it('detects known chunk failure messages', () => {
    expect(isChunkLoadError(new Error('ChunkLoadError: Loading chunk 5 failed'))).toBe(true);
    expect(isChunkLoadError('Failed to fetch dynamically imported module')).toBe(true);
    expect(isChunkLoadError(new Error('Importing a module script failed'))).toBe(true);
    expect(isChunkLoadError(new Error('something else'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});

describe('ChunkErrorBoundary', () => {
  it('renders children when healthy', () => {
    render(
      <ChunkErrorBoundary>
        <span>ok</span>
      </ChunkErrorBoundary>,
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('shows hard error for chunk load failures', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function ChunkBoom(): never {
      throw new Error('Loading chunk 12 failed');
    }

    renderWithProviders(
      <ChunkErrorBoundary>
        <ChunkBoom />
      </ChunkErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Failed to load this page' })).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
