import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getProductBySlug } from './productsData';
import { FLOW_DOCUMENT_CAPABILITY_GROUPS, FLOW_DOCUMENT_IMAGE_BASE } from './flowDocumentsData';
import { ProductTourStructureExample } from './ProductTourStructureExample';
import { ProductCapabilityGroupSection } from './ProductCapabilityGroupSection';
import { CaptureEditorDetailPage } from './CaptureEditorDetailPage';
import { FlowDocumentDetailPage } from './FlowDocumentDetailPage';
import { ProductTourDetailPage } from './ProductTourDetailPage';
import { ProductTourAdvantages } from './ProductTourAdvantages';
import { ProductTourAudienceGrid } from './ProductTourAudienceGrid';
import { ProductTourPersonaBenefits } from './ProductTourPersonaBenefits';
import { ProductTourTraditionalGap } from './ProductTourTraditionalGap';
import { FlowDocumentLifecycle } from './FlowDocumentLifecycle';
import { CaptureEditorPainPoints } from './CaptureEditorPainPoints';
import { CaptureEditorWorkflow } from './CaptureEditorWorkflow';
import { ProductDetailCapabilityContent } from './ProductDetailCapabilityContent';

vi.mock('@/components/site/SiteNav', () => ({
  SiteNav: () => <nav>SiteNav</nav>,
}));

vi.mock('@/components/AppFooter', () => ({
  AppFooter: () => <footer>AppFooter</footer>,
}));

vi.mock('@/utils/extensionGate', () => ({
  getExtensionGatePath: (path: string) => path,
}));

function wrap(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('product detail smoke', () => {
  it('ProductTourStructureExample', () => {
    wrap(<ProductTourStructureExample />);
    expect(screen.getByRole('heading', { name: /One tour, many features/i })).toBeInTheDocument();
  });

  it('ProductCapabilityGroupSection', () => {
    const group = FLOW_DOCUMENT_CAPABILITY_GROUPS[0]!;
    wrap(
      <ProductCapabilityGroupSection
        group={group}
        groupIndex={0}
        capabilityStartIndex={0}
        imageBase={FLOW_DOCUMENT_IMAGE_BASE}
      />,
    );
    expect(screen.getByRole('heading', { name: group.label })).toBeInTheDocument();
  });

  it('ProductDetailCapabilityContent', () => {
    const capability = FLOW_DOCUMENT_CAPABILITY_GROUPS[0]!.capabilities[0]!;
    wrap(
      <ProductDetailCapabilityContent
        capability={capability}
        layoutIndex={0}
        isImageRight={false}
      />,
    );
    expect(screen.getByRole('heading', { name: capability.title })).toBeInTheDocument();
  });

  it('section presentational pages', () => {
    wrap(
      <>
        <ProductTourAdvantages />
        <ProductTourAudienceGrid />
        <ProductTourPersonaBenefits />
        <ProductTourTraditionalGap />
        <FlowDocumentLifecycle />
        <CaptureEditorPainPoints />
        <CaptureEditorWorkflow />
      </>,
    );
    expect(screen.getByRole('heading', { name: /How Product Tours help/i })).toBeInTheDocument();
  });

  it('detail pages', () => {
    const flow = getProductBySlug('flow-documents')!;
    const tour = getProductBySlug('product-tours')!;
    const capture = getProductBySlug('capture-screenshot-editor')!;

    const { rerender } = wrap(<FlowDocumentDetailPage product={flow} />);
    expect(screen.getByText('SiteNav')).toBeInTheDocument();
    expect(screen.getByText('AppFooter')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ProductTourDetailPage product={tour} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Compose your first product tour/i })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CaptureEditorDetailPage product={capture} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Capture, edit, share/i })).toBeInTheDocument();
  });
});
