import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowCaptureEnvironment, FlowPayload } from '@peacock/shared';

vi.mock('@react-pdf/renderer', async () => import('./reactPdfTestMock'));

import { PdfCoverPage } from './PdfCoverPage';

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

function makeFlow(overrides?: {
  title?: string;
  description?: string;
  version?: string;
  captureEnvironment?: FlowCaptureEnvironment;
}): FlowPayload {
  return {
    flow: {
      title: overrides?.title ?? 'Expense approval',
      description: overrides?.description ?? '<p>Submit and approve expenses</p>',
      version: overrides?.version ?? '2.1.0',
      category: '',
      tags: [],
    },
    metadata: {
      createdAt: Date.UTC(2024, 5, 15),
      browser: 'Chrome',
      platform: 'MacIntel',
      screen: { width: 1440, height: 900 },
      captureEnvironment: overrides?.captureEnvironment,
    },
    steps: [],
  };
}

describe('PdfCoverPage', () => {
  it('renders title, stripped description, version, and step count', () => {
    render(
      <PdfCoverPage
        flow={makeFlow()}
        stepCount={12}
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.getByText('Flow details')).toBeInTheDocument();
    expect(screen.getByText('Expense approval')).toBeInTheDocument();
    expect(screen.getByText('Submit and approve expenses')).toBeInTheDocument();
    expect(screen.getByText('Version 2.1.0')).toBeInTheDocument();
    expect(screen.getByText('Steps')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Recorded')).toBeInTheDocument();
    expect(screen.queryByText('Capture metadata')).not.toBeInTheDocument();
  });

  it('uses empty-state copy when title, description, and version are blank', () => {
    render(
      <PdfCoverPage
        flow={makeFlow({ title: '', description: '   ', version: '  ' })}
        stepCount={0}
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.getByText('Untitled Flow')).toBeInTheDocument();
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
    expect(screen.getByText('Unversioned')).toBeInTheDocument();
  });

  it('mentions capture metadata when capture environment is present', () => {
    render(
      <PdfCoverPage
        flow={makeFlow({ captureEnvironment })}
        stepCount={3}
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.getByText('Capture metadata')).toBeInTheDocument();
    expect(screen.getByText('Included on next page')).toBeInTheDocument();
  });
});
