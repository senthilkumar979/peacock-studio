import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ResolvedShareLink } from '@/types/shareLink';

const applyMetaTags = vi.fn();
const setDocumentTitle = vi.fn();

vi.mock('@/seo/applyHeadMeta', () => ({
  applyMetaTags: (...args: any[]) => (applyMetaTags as any)(...args),
  setDocumentTitle: (...args: any[]) => (setDocumentTitle as any)(...args),
}));

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    getPlayableSteps: () => [{ id: 'step-1', screenshotId: 'shot-1' }],
    getStepScreenshotUrl: () => 'https://cdn.example/shot.png',
  };
});

const useFlowStore = vi.fn();
vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (state: unknown) => unknown) => useFlowStore(selector),
}));

const useSavedProductTour = vi.fn();
vi.mock('@/hooks/useSavedProductTour', () => ({
  useSavedProductTour: (...args: any[]) => (useSavedProductTour as any)(...args),
}));

import { ShareDocumentMeta } from './ShareDocumentMeta';

const documentLink: ResolvedShareLink = {
  token: 'tok',
  organizationId: 'org-1',
  resourceType: 'document',
  resourceId: 'doc-1',
  accessMode: 'readonly',
  channel: 'link',
  settings: {},
};

describe('ShareDocumentMeta', () => {
  it('applies document share meta when the flow is ready', () => {
    useFlowStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        flow: {
          flow: {
            title: 'Onboarding',
            description: '<p>Welcome guide</p>',
          },
        },
        steps: [],
        screenshotUrls: {},
      }),
    );
    useSavedProductTour.mockReturnValue({ isLoaded: false, tour: null });

    render(
      <ShareDocumentMeta
        link={documentLink}
        isDocumentReady
        sharePath="/s/tok"
      />,
    );

    expect(setDocumentTitle).toHaveBeenCalledWith(
      expect.stringContaining('Onboarding'),
    );
    expect(applyMetaTags).toHaveBeenCalled();
    const tags = applyMetaTags.mock.calls[0]?.[0] as Array<{ key: string; content: string }>;
    expect(tags.some((tag) => tag.key === 'robots' && tag.content === 'noindex,nofollow')).toBe(
      true,
    );
    expect(tags.some((tag) => tag.key === 'og:image' && tag.content.includes('shot.png'))).toBe(
      true,
    );
  });

  it('applies tour share meta when the tour is loaded', () => {
    useFlowStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ flow: null, steps: [], screenshotUrls: {} }),
    );
    useSavedProductTour.mockReturnValue({
      isLoaded: true,
      tour: { title: 'Sales demo', description: 'Tour for reps' },
    });

    render(
      <ShareDocumentMeta
        link={{ ...documentLink, resourceType: 'tour', resourceId: 'tour-1' }}
        isDocumentReady={false}
        sharePath="/s/tour-tok"
      />,
    );

    expect(setDocumentTitle).toHaveBeenCalledWith(expect.stringContaining('Sales demo'));
    expect(applyMetaTags).toHaveBeenCalled();
  });

  it('does nothing without a link', () => {
    useFlowStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ flow: null, steps: [], screenshotUrls: {} }),
    );
    useSavedProductTour.mockReturnValue({ isLoaded: false, tour: null });
    applyMetaTags.mockClear();
    setDocumentTitle.mockClear();

    render(
      <ShareDocumentMeta link={null} isDocumentReady={false} sharePath="/s/x" />,
    );

    expect(setDocumentTitle).not.toHaveBeenCalled();
    expect(applyMetaTags).not.toHaveBeenCalled();
  });
});
