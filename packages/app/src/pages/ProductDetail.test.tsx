import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isSignedIn: false, isLoaded: true, getToken: vi.fn() }),
  useUser: () => ({ isLoaded: true, user: null }),
  useClerk: () => ({ redirectToSignIn: vi.fn(), signOut: vi.fn() }),
  SignedIn: () => null,
  SignedOut: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
  getClerkPublishableKey: () => '',
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useIsAuthenticatedAppUser: () => false,
  useSessionMode: () => 'guest',
}));

vi.mock('@/pages/products/FlowDocumentDetailPage', () => ({
  FlowDocumentDetailPage: ({ product }: { product: { name: string } }) => (
    <h1>{product.name}</h1>
  ),
}));
vi.mock('@/pages/products/ProductTourDetailPage', () => ({
  ProductTourDetailPage: ({ product }: { product: { name: string } }) => (
    <h1>{product.name}</h1>
  ),
}));
vi.mock('@/pages/products/CaptureEditorDetailPage', () => ({
  CaptureEditorDetailPage: ({ product }: { product: { name: string } }) => (
    <h1>{product.name}</h1>
  ),
}));

import { ProductDetail } from './ProductDetail';

describe('ProductDetail', () => {
  it('renders flow documents detail for known slug', () => {
    render(
      <MemoryRouter initialEntries={['/products/flow-documents']}>
        <Routes>
          <Route path="/products/:productSlug" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /flow documents/i })).toBeInTheDocument();
  });

  it('redirects unknown slug to /products', () => {
    render(
      <MemoryRouter initialEntries={['/products/not-a-real-product']}>
        <Routes>
          <Route path="/products/:productSlug" element={<ProductDetail />} />
          <Route path="/products" element={<div>Products index</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Products index')).toBeInTheDocument();
  });
});
