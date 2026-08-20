import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('@/utils/notify', () => ({ notifyError: vi.fn() }));
vi.mock('@/services/routeLibraryService', () => ({
  createAndSaveRoute: vi.fn(async () => ({ id: 'route-1' })),
}));

import { NewRoute } from './NewRoute';

describe('NewRoute', () => {
  it('shows creating loader and navigates to builder', async () => {
    renderWithRouter(<NewRoute />);
    expect(screen.getByText(/creating route/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/routes/route-1/edit', { replace: true });
    });
  });
});
