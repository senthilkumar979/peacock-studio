import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowPayload } from '@peacock/shared';

const buildPdfExportPages = vi.fn();
const countPdfStepPages = vi.fn();
const registerPdfFonts = vi.fn();
const renderPdfBlob = vi.fn();
const isCloudLibraryActive = vi.fn();
const requireCapability = vi.fn();
const recordOrgEvent = vi.fn();
const getPdfLogoUrl = vi.fn();

vi.mock('./buildPdfExportPages', () => ({
  buildPdfExportPages: (...args: any[]) => (buildPdfExportPages as any)(...args),
  countPdfStepPages: (...args: any[]) => (countPdfStepPages as any)(...args),
}));

vi.mock('./registerPdfFonts', () => ({
  registerPdfFonts: (...args: any[]) => (registerPdfFonts as any)(...args),
}));

vi.mock('./renderPdfBlob', () => ({
  renderPdfBlob: (...args: any[]) => (renderPdfBlob as any)(...args),
}));

vi.mock('./FlowDocument', () => ({
  FlowDocument: () => null,
}));

vi.mock('./pdfConstants', () => ({
  getPdfLogoUrl: (...args: any[]) => (getPdfLogoUrl as any)(...args),
}));

vi.mock('@/cloud/authContext', () => ({
  isCloudLibraryActive: (...args: any[]) => (isCloudLibraryActive as any)(...args),
  requireCapability: (...args: any[]) => (requireCapability as any)(...args),
}));

vi.mock('@/cloud/repositories/analyticsRepository', () => ({
  recordOrgEvent: (...args: any[]) => (recordOrgEvent as any)(...args),
}));

import { exportFlowPdf } from './exportFlowPdf';

const flow: FlowPayload = {
  flow: {
    title: 'My Cool Flow!',
    description: '',
    version: '1.0.0',
    category: '',
    tags: [],
  },
  metadata: {
    createdAt: 1,
    browser: 'Chrome',
    platform: 'MacIntel',
    screen: { width: 1440, height: 900 },
  },
  steps: [],
};

describe('exportFlowPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isCloudLibraryActive.mockReturnValue(false);
    getPdfLogoUrl.mockReturnValue('https://example.com/logo.png');
    buildPdfExportPages.mockResolvedValue([{ type: 'step' }]);
    countPdfStepPages.mockReturnValue(1);
    renderPdfBlob.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pdf');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  it('requires export capability in cloud library mode', async () => {
    isCloudLibraryActive.mockReturnValue(true);
    await exportFlowPdf({
      flow,
      steps: [],
      screenshotUrls: {},
    });
    expect(requireCapability).toHaveBeenCalledWith('export');
  });

  it('returns early when there are no step pages', async () => {
    countPdfStepPages.mockReturnValue(0);
    await exportFlowPdf({
      flow,
      steps: [],
      screenshotUrls: {},
    });
    expect(renderPdfBlob).not.toHaveBeenCalled();
  });

  it('renders, downloads, and records a pdf_export event', async () => {
    const click = vi.fn();
    const createElement = vi.spyOn(document, 'createElement');
    createElement.mockImplementation(((tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click,
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tag);
    }) as typeof document.createElement);

    await exportFlowPdf({
      flow,
      steps: [],
      screenshotUrls: { a: 'https://example.com/a.png' },
    });

    expect(registerPdfFonts).toHaveBeenCalled();
    expect(renderPdfBlob).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(recordOrgEvent).toHaveBeenCalledWith('pdf_export', {
      metadata: { stepCount: 1 },
    });

    createElement.mockRestore();
  });
});
