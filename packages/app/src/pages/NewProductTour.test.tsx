import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('@/analytics/analyticsClient', () => ({ trackEvent: vi.fn() }));
vi.mock('@/utils/notify', () => ({ notifyError: vi.fn() }));
vi.mock('@/services/productTourLibraryService', () => ({
  createAndSaveProductTourOnce: vi.fn(async () => ({ id: 'tour-1' })),
}));

import { NewProductTour } from './NewProductTour';

describe('NewProductTour', () => {
  it('shows creating loader and navigates to builder', async () => {
    renderWithRouter(<NewProductTour />);
    expect(screen.getByText(/creating product tour/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/tours/tour-1/edit', { replace: true });
    });
  });
});
