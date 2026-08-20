import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PEACOCK_APP_NAME } from '@/constants/branding';

vi.mock('@/seo/applyHeadMeta', () => ({
  applyMetaTags: vi.fn(),
  removeJsonLd: vi.fn(),
  setDocumentTitle: vi.fn(),
  upsertJsonLd: vi.fn(),
  upsertLink: vi.fn(),
}));

import {
  applyMetaTags,
  removeJsonLd,
  setDocumentTitle,
  upsertJsonLd,
  upsertLink,
} from '@/seo/applyHeadMeta';
import { RouteDocumentMeta } from './RouteDocumentMeta';

describe('RouteDocumentMeta', () => {
  it('applies route meta for a marketing path', () => {
    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <Routes>
          <Route path="*" element={<RouteDocumentMeta />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(setDocumentTitle).toHaveBeenCalledWith(expect.stringContaining('Pricing'));
    expect(applyMetaTags).toHaveBeenCalled();
    expect(upsertLink).toHaveBeenCalledWith(
      'canonical',
      'https://peacockstudio.app/pricing',
    );
    expect(removeJsonLd).toHaveBeenCalledWith('peacock-landing-jsonld');
  });

  it('attaches landing JSON-LD on home and restores title on unmount', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<RouteDocumentMeta />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(upsertJsonLd).toHaveBeenCalledWith(
      'peacock-landing-jsonld',
      expect.objectContaining({ '@context': 'https://schema.org' }),
    );

    unmount();
    expect(setDocumentTitle).toHaveBeenLastCalledWith(PEACOCK_APP_NAME);
  });
});
