import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PDF_FOOTER_TAGLINE } from './pdfConstants';

vi.mock('@react-pdf/renderer', async () => import('./reactPdfTestMock'));

import { PdfPageFooter, PdfPageHeader } from './PdfPageChrome';

describe('PdfPageHeader', () => {
  it('renders the flow title when showHeader is true', () => {
    render(<PdfPageHeader flowTitle="Expense report" />);
    expect(screen.getByText('Expense report')).toBeInTheDocument();
  });

  it('returns null when showHeader is false', () => {
    const { container } = render(
      <PdfPageHeader flowTitle="Hidden" showHeader={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('PdfPageFooter', () => {
  it('renders the logo, tagline, and page numbers', () => {
    render(<PdfPageFooter logoSrc="https://example.com/logo.png" />);

    const image = screen.getByTestId('pdf-image');
    expect(image).toHaveAttribute('data-src', 'https://example.com/logo.png');
    expect(screen.getByText(PDF_FOOTER_TAGLINE)).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });
});
