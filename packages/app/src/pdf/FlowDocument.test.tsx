import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type {
  FlowBranch,
  FlowCaptureEnvironment,
  FlowPayload,
  FlowStep,
  LinkedPeacockPath,
} from '@peacock/shared';
import type { PdfExportPage } from './buildPdfExportPages';
import type { PdfStepContentSlice } from './pdfStepLayout';

vi.mock('@react-pdf/renderer', async () => import('./reactPdfTestMock'));

import { FlowDocument } from './FlowDocument';

const captureEnvironment: FlowCaptureEnvironment = {
  userAgent: 'Mozilla/5.0',
  locale: 'en-US',
  languages: ['en-US'],
  timezone: 'UTC',
  platform: 'MacIntel',
  os: { family: 'macos', name: 'macOS', version: '15' },
  browser: { family: 'chrome', name: 'Chrome', version: '120' },
  device: { category: 'desktop', type: 'computer' },
  screen: {
    width: 1440,
    height: 900,
    availWidth: 1440,
    availHeight: 860,
    devicePixelRatio: 2,
  },
  viewport: { width: 1280, height: 800 },
  recordingStartedAt: 1,
  recordingEndedAt: 2,
  durationMs: 1,
};

function makeFlow(options?: {
  title?: string;
  withCapture?: boolean;
}): FlowPayload {
  return {
    flow: {
      title: options?.title ?? 'Hiring flow',
      description: 'Guide for hiring',
      version: '1.0.0',
      category: '',
      tags: [],
    },
    metadata: {
      createdAt: 1,
      browser: 'Chrome',
      platform: 'MacIntel',
      screen: { width: 1440, height: 900 },
      captureEnvironment: options?.withCapture ? captureEnvironment : undefined,
    },
    steps: [],
  };
}

function makeStep(id: string, title: string): FlowStep {
  return {
    id,
    title,
    notes: `${title} notes`,
    generatedTitle: title,
    generatedDescription: '',
    screenshotId: `${id}-shot`,
    event: {
      id: `${id}-ev`,
      type: 'page-view',
      timestamp: 1,
      url: `https://example.com/${id}`,
      title,
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: `${id}-shot`,
    },
  };
}

function makeSlice(overrides: Partial<PdfStepContentSlice> = {}): PdfStepContentSlice {
  return {
    instructions: 'Do the thing',
    detailedDescription: '',
    resources: [],
    showScreenshot: false,
    pageIndex: 0,
    pageCount: 1,
    ...overrides,
  };
}

const selectedPath: LinkedPeacockPath = {
  id: 'path-a',
  order: 0,
  label: 'Path A',
  targetDocumentId: 'doc-a',
  targetTitle: 'Doc A',
  targetDescription: '',
  fromStepId: 's1',
  toStepId: 's2',
};

const branch: FlowBranch = {
  id: 'branch-1',
  kind: 'branch',
  title: 'Pick a path',
  description: 'Branch description',
  presentation: 'list',
  paths: [
    selectedPath,
    {
      id: 'path-b',
      order: 1,
      label: 'Path B',
      targetDocumentId: 'doc-b',
      targetTitle: 'Doc B',
      targetDescription: '',
      fromStepId: 's3',
      toStepId: 's4',
    },
  ],
};

describe('FlowDocument', () => {
  it('renders cover and step pages without capture environment', () => {
    const step = makeStep('step-1', 'First step');
    const pages: PdfExportPage[] = [
      {
        kind: 'step',
        step,
        screenshotUrls: {},
        slice: makeSlice(),
        resources: [],
      },
    ];

    render(
      <FlowDocument
        flow={makeFlow()}
        pages={pages}
        stepCount={1}
        logoSrc="https://example.com/logo.png"
      />,
    );

    const document = screen.getByTestId('pdf-document');
    expect(document).toHaveAttribute('data-title', 'Hiring flow');
    expect(document).toHaveAttribute('data-author', 'Peacock Studio');
    expect(screen.getByText('Flow details')).toBeInTheDocument();
    expect(screen.getAllByText('Hiring flow').length).toBeGreaterThan(0);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.queryByText('Session metadata')).not.toBeInTheDocument();
  });

  it('inserts capture environment page and numbers multi-slice steps', () => {
    const step = makeStep('step-1', 'Long step');
    const pages: PdfExportPage[] = [
      {
        kind: 'branch',
        branch,
        selectedPath,
      },
      {
        kind: 'step',
        step,
        screenshotUrls: {},
        slice: makeSlice({ pageIndex: 0, pageCount: 2, instructions: 'Part one' }),
        resources: [],
      },
      {
        kind: 'step',
        step,
        screenshotUrls: {},
        slice: makeSlice({ pageIndex: 1, pageCount: 2, instructions: 'Part two' }),
        resources: [],
      },
      {
        kind: 'step',
        step: makeStep('step-2', 'Second step'),
        screenshotUrls: {},
        slice: makeSlice({ instructions: 'Next action' }),
        resources: [],
      },
    ];

    render(
      <FlowDocument
        flow={makeFlow({ withCapture: true })}
        pages={pages}
        stepCount={2}
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.getAllByText('Session metadata').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Captured environment')).toBeInTheDocument();
    expect(screen.getByText('Branch point')).toBeInTheDocument();
    expect(screen.getByText('Pick a path')).toBeInTheDocument();
    expect(screen.getByText('Step 1 (1/2)')).toBeInTheDocument();
    expect(screen.getByText('Step 1 (2/2)')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
  });

  it('falls back to Untitled Flow when title is blank', () => {
    render(
      <FlowDocument
        flow={makeFlow({ title: '' })}
        pages={[]}
        stepCount={0}
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.getByTestId('pdf-document')).toHaveAttribute(
      'data-title',
      'Untitled Flow',
    );
    expect(screen.getByText('Untitled Flow')).toBeInTheDocument();
  });
});
