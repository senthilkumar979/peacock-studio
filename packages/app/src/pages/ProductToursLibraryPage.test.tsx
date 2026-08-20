import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@/components/library/ProductToursLibraryPanel', () => ({
  ProductToursLibraryPanel: () => <div>Product tours panel</div>,
}));

import { ProductToursLibraryPage } from './ProductToursLibraryPage';

describe('ProductToursLibraryPage', () => {
  it('renders library panel wrapper', () => {
    renderWithRouter(<ProductToursLibraryPage />);
    expect(screen.getByText('Product tours panel')).toBeInTheDocument();
  });
});
