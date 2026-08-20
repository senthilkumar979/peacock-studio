import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EMBED_IFRAME_HEIGHT,
  EMBED_IFRAME_WIDTH,
  FLOW_DETAILS_OUTLINE_ID,
  PUBLIC_SHARE_PATH,
  buildEmbedIframeCode,
  buildPublicShareUrl,
  buildSharedDocumentUrl,
  buildSharedProductTourUrl,
  buildSharedRouteUrl,
  copyTextToClipboard,
  getDocumentAnchorShareUrl,
  getDocumentEditPath,
  getDocumentFlowDetailsAnchor,
  getDocumentHubPath,
  getDocumentPath,
  getDocumentShareUrl,
  getDocumentStepAnchor,
  getDocumentStepShareUrl,
  getLinkedDocumentPathAnchor,
  getLinkedDocumentStepAnchor,
  getLinkedDocumentStepShareUrl,
  getPublicSharePath,
  parseLinkedDocumentPathAnchor,
  parseLinkedDocumentStepAnchor,
  resolveLinkedPathIdFromAnchor,
} from './shareLink';

const PATH_ID = '11111111-1111-1111-1111-111111111111';
const STEP_ID = '22222222-2222-2222-2222-222222222222';

describe('shareLink path helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { origin: 'https://peacock.test' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds public share paths for view, edit, and embed', () => {
    expect(PUBLIC_SHARE_PATH).toBe('/s');
    expect(getPublicSharePath('tok')).toBe('/s/tok');
    expect(getPublicSharePath('tok', { editable: true })).toBe('/s/tok/edit');
    expect(getPublicSharePath('tok', { embed: true })).toBe('/s/tok/embed');
    expect(buildPublicShareUrl('tok', { editable: true })).toBe(
      'https://peacock.test/s/tok/edit',
    );
  });

  it('builds document paths and hub/edit variants', () => {
    expect(getDocumentEditPath('doc-1')).toBe('/docs/doc-1/edit');
    expect(getDocumentPath('doc-1')).toBe('/docs/doc-1');
    expect(getDocumentPath('doc-1', 'hub')).toBe('/docs/doc-1');
    expect(getDocumentPath('doc-1', 'player')).toBe('/docs/doc-1?view=player');
    expect(getDocumentHubPath('doc-1')).toBe('/docs/doc-1?view=hub');
  });

  it('builds shared document URLs for readonly and editable', () => {
    expect(buildSharedDocumentUrl('doc-1')).toBe('https://peacock.test/docs/doc-1?view=doc');
    expect(buildSharedDocumentUrl('doc-1', { accessMode: 'editable', query: '?x=1' })).toBe(
      'https://peacock.test/docs/doc-1/edit?x=1',
    );
    expect(getDocumentShareUrl('doc-1', 'player', '#a')).toBe(
      'https://peacock.test/docs/doc-1?view=player#a',
    );
  });

  it('builds route and product tour share URLs', () => {
    expect(buildSharedRouteUrl('r1')).toBe('https://peacock.test/routes/r1');
    expect(buildSharedRouteUrl('r1', 'editable')).toBe('https://peacock.test/routes/r1/edit');
    expect(buildSharedProductTourUrl('t1')).toBe('https://peacock.test/tours/t1');
    expect(buildSharedProductTourUrl('t1', 'editable', { presenter: true })).toBe(
      'https://peacock.test/tours/t1/edit?presenter=1',
    );
  });

  it('builds embed iframe markup and escapes quotes in title', () => {
    const code = buildEmbedIframeCode('https://x.test/e', 'Say "hi"');
    expect(code).toContain(`width="${EMBED_IFRAME_WIDTH}"`);
    expect(code).toContain(`height="${EMBED_IFRAME_HEIGHT}"`);
    expect(code).toContain('title="Say &quot;hi&quot;"');
    expect(code).toContain('src="https://x.test/e"');
  });

  it('builds and parses document anchors', () => {
    expect(getDocumentFlowDetailsAnchor()).toBe('flow-details');
    expect(FLOW_DETAILS_OUTLINE_ID).toBe('flow-details');
    expect(getDocumentStepAnchor(STEP_ID)).toBe(`step-${STEP_ID}`);
    expect(getLinkedDocumentPathAnchor(PATH_ID)).toBe(`linked-path-${PATH_ID}`);
    expect(getLinkedDocumentStepAnchor(PATH_ID, STEP_ID)).toBe(
      `linked-${PATH_ID}-${STEP_ID}`,
    );

    expect(parseLinkedDocumentPathAnchor(`linked-path-${PATH_ID}`)).toBe(PATH_ID);
    expect(parseLinkedDocumentPathAnchor('linked-path-not-a-uuid')).toBeNull();
    expect(parseLinkedDocumentStepAnchor(`linked-${PATH_ID}-${STEP_ID}`)).toEqual({
      pathId: PATH_ID,
      stepId: STEP_ID,
    });
    expect(parseLinkedDocumentStepAnchor('linked-bad')).toBeNull();
    expect(resolveLinkedPathIdFromAnchor(`linked-path-${PATH_ID}`)).toBe(PATH_ID);
    expect(resolveLinkedPathIdFromAnchor(`linked-${PATH_ID}-${STEP_ID}`)).toBe(PATH_ID);
    expect(resolveLinkedPathIdFromAnchor('other')).toBeNull();

    expect(getDocumentAnchorShareUrl('doc-1', 'flow-details')).toBe(
      'https://peacock.test/docs/doc-1?view=doc#flow-details',
    );
    expect(getDocumentStepShareUrl('doc-1', STEP_ID)).toContain(`#step-${STEP_ID}`);
    expect(getLinkedDocumentStepShareUrl('doc-1', PATH_ID, STEP_ID)).toContain(
      `#linked-${PATH_ID}-${STEP_ID}`,
    );
  });
});

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes text via navigator.clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await copyTextToClipboard('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
  });
});
