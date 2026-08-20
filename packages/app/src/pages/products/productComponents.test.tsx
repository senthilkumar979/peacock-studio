import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FileText } from 'lucide-react';

import { CaptureEditorHero } from './CaptureEditorHero';
import { FlowDocumentHero } from './FlowDocumentHero';
import { ProductTourHero } from './ProductTourHero';
import { ProductFeatureImage } from './ProductFeatureImage';
import { ProductScreenshotPlaceholder } from './ProductScreenshotPlaceholder';
import type { Product } from './productsData';

const sampleProduct: Product = {
  slug: 'flow-documents',
  name: 'Flow Documents',
  shortName: 'Flow Documents',
  tagline: 'Execution-grade guides',
  summary: 'Summary',
  overview: 'Overview',
  highlights: [],
  idealFor: [],
  icon: FileText,
  accentGradient: 'from-peacock-700 to-peacock-900',
  iconBg: 'bg-peacock-50',
};

describe('product presentational components', () => {
  it('FlowDocumentHero', () => {
    render(
      <MemoryRouter>
        <FlowDocumentHero product={sampleProduct} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /flow documents/i })).toBeInTheDocument();
  });

  it('ProductTourHero', () => {
    render(
      <MemoryRouter>
        <ProductTourHero product={{ ...sampleProduct, name: 'Product Tours', slug: 'product-tours' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /product tours/i })).toBeInTheDocument();
  });

  it('CaptureEditorHero', () => {
    render(
      <MemoryRouter>
        <CaptureEditorHero
          product={{
            ...sampleProduct,
            name: 'Capture & Editor',
            slug: 'capture-screenshot-editor',
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /capture & editor/i })).toBeInTheDocument();
  });

  it('ProductScreenshotPlaceholder without image', () => {
    render(<ProductScreenshotPlaceholder productName="Flow Documents" />);
    expect(screen.getByText(/screenshot placeholder/i)).toBeInTheDocument();
  });

  it('ProductScreenshotPlaceholder with image', () => {
    render(
      <ProductScreenshotPlaceholder productName="Flow Documents" imageSrc="/shot.png" />,
    );
    expect(screen.getByAltText(/flow documents product screenshot/i)).toBeInTheDocument();
  });

  it('ProductFeatureImage falls back on error', () => {
    render(
      <ProductFeatureImage
        title="Hero shot"
        imageSrc="/missing.png"
        suggestedPublicPath="/products/missing.png"
      />,
    );
    const img = screen.getByAltText(/hero shot screenshot/i);
    fireEvent.error(img);
    expect(screen.getByText(/screenshot: hero shot/i)).toBeInTheDocument();
  });
});
