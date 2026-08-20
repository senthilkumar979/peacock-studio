import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompareDocumentPane } from './CompareDocumentPane';

vi.mock('./BrowserMockup', () => ({
  BrowserMockup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('./PlayerClickMarker', () => ({ PlayerClickMarker: () => null }));

describe('CompareDocumentPane', () => {
  it('renders empty select state', () => {
    render(
      <CompareDocumentPane
        label="Left document"
        summaries={[{ id: 'a', title: 'Doc A', updatedAt: 1, createdAt: 1, stepCount: 0, version: '1' } as never]}
        selectedId=""
        onSelect={vi.fn()}
        document={null}
        isLoading={false}
        currentIndex={0}
      />,
    );
    expect(screen.getByText(/select a document to compare/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
