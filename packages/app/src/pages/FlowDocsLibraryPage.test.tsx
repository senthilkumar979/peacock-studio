import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@/components/library/FlowDocsLibraryPanel', () => ({
  FlowDocsLibraryPanel: () => <div>Flow docs panel</div>,
}));

import { FlowDocsLibraryPage } from './FlowDocsLibraryPage';

describe('FlowDocsLibraryPage', () => {
  it('renders library panel wrapper', () => {
    renderWithRouter(<FlowDocsLibraryPage />);
    expect(screen.getByText('Flow docs panel')).toBeInTheDocument();
  });
});
