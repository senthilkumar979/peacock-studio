import { beforeEach, describe, expect, it, vi } from 'vitest';

const isCloudSyncEnabled = vi.fn(() => true);
const createOrUpdateShareLink = vi.fn();
const getFlowDocument = vi.fn();
const getProductTour = vi.fn();
const collectTourShareDocumentIds = vi.fn(async () => ['doc-1']);

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => isCloudSyncEnabled(),
}));

vi.mock('@/cloud/repositories/shareLinkRepository', () => ({
  createOrUpdateShareLink: (...args: any[]) => (createOrUpdateShareLink as any)(...args),
}));

vi.mock('@/storage/libraryRouter', () => ({
  getFlowDocument: (...args: any[]) => (getFlowDocument as any)(...args),
  getProductTour: (...args: any[]) => (getProductTour as any)(...args),
}));

vi.mock('@/utils/collectTourShareDocumentIds', () => ({
  collectTourShareDocumentIds: (...args: any[]) => (collectTourShareDocumentIds as any)(...args),
}));

vi.mock('@/utils/shareLink', () => ({
  buildPublicShareUrl: (token: string, opts?: { embed?: boolean; editable?: boolean }) =>
    `https://app/s/${token}${opts?.embed ? '?embed=1' : ''}${opts?.editable ? '?edit=1' : ''}`,
  buildSharedDocumentUrl: (
    id: string,
    opts: { accessMode: string; viewMode?: string; query?: string },
  ) => `local://${id}/${opts.accessMode}${opts.query ?? ''}`,
  buildSharedProductTourUrl: (id: string, mode: string) => `local-tour://${id}/${mode}`,
  buildEmbedIframeCode: (url: string, title: string) => `<iframe src="${url}" title="${title}">`,
}));

import {
  createDocumentEmbedCode,
  createDocumentShareUrl,
  createProductTourEmbedCode,
  createProductTourShareUrl,
} from './shareLinkService';
import { ShareNotAllowedError } from './shareErrors';

describe('shareLinkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isCloudSyncEnabled.mockReturnValue(true);
    getFlowDocument.mockResolvedValue({ id: 'doc-1', status: 'live' });
    getProductTour.mockResolvedValue({ id: 'tour-1', title: 'Tour' });
    createOrUpdateShareLink.mockResolvedValue({ token: 'share-tok' });
  });

  it('createDocumentShareUrl local mode builds query', async () => {
    isCloudSyncEnabled.mockReturnValue(false);
    const url = await createDocumentShareUrl('doc-1', {
      accessMode: 'readonly',
      shareSettings: { includeMainFlow: true, enabledPathIds: ['p1'], enabledBranchIds: ['b1'] },
      presenter: true,
    });
    expect(url).toContain('paths=p1');
    expect(url).toContain('presenter=1');
  });

  it('createDocumentShareUrl cloud mode creates link', async () => {
    const url = await createDocumentShareUrl('doc-1', {
      accessMode: 'editable',
      viewMode: 'doc',
    });
    expect(url).toContain('share-tok');
    expect(createOrUpdateShareLink).toHaveBeenCalledWith(
      expect.objectContaining({ resourceType: 'document', accessMode: 'editable' }),
    );
  });

  it('rejects non-live documents', async () => {
    getFlowDocument.mockResolvedValue({ id: 'doc-1', status: 'draft' });
    await expect(
      createDocumentShareUrl('doc-1', { accessMode: 'readonly' }),
    ).rejects.toBeInstanceOf(ShareNotAllowedError);

    getFlowDocument.mockResolvedValue(undefined);
    await expect(
      createDocumentShareUrl('doc-1', { accessMode: 'readonly' }),
    ).rejects.toThrow(/not found/);
  });

  it('embed helpers require cloud sync', async () => {
    isCloudSyncEnabled.mockReturnValue(false);
    await expect(createDocumentEmbedCode('doc-1')).rejects.toThrow(/Embeds require cloud sync/);
    await expect(createProductTourEmbedCode('tour-1')).rejects.toThrow(/Embeds require cloud sync/);
  });

  it('createDocumentEmbedCode and tour share/embed', async () => {
    const embed = await createDocumentEmbedCode('doc-1', { title: 'Guide' });
    expect(embed.iframeCode).toContain('Guide');

    isCloudSyncEnabled.mockReturnValue(false);
    await expect(
      createProductTourShareUrl('tour-1', { accessMode: 'readonly' }),
    ).resolves.toContain('local-tour://tour-1');

    isCloudSyncEnabled.mockReturnValue(true);
    await expect(
      createProductTourShareUrl('tour-1', { accessMode: 'readonly', presenter: true }),
    ).resolves.toContain('share-tok');

    const tourEmbed = await createProductTourEmbedCode('tour-1');
    expect(tourEmbed.embedUrl).toContain('embed=1');

    getProductTour.mockResolvedValue(undefined);
    await expect(
      createProductTourShareUrl('missing', { accessMode: 'readonly' }),
    ).rejects.toThrow(/not found/);
  });
});
