import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowCaptureEnvironment } from '@peacock/shared';

vi.mock('@react-pdf/renderer', async () => import('./reactPdfTestMock'));

import { PdfCaptureEnvironmentPanel } from './PdfCaptureEnvironmentPanel';

const environment: FlowCaptureEnvironment = {
  userAgent: 'Mozilla/5.0 (Macintosh) Chrome/120',
  locale: 'en-US',
  languages: ['en-US'],
  timezone: 'UTC',
  platform: 'MacIntel',
  os: { family: 'macos', name: 'macOS', version: '15.0' },
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
  recordingEndedAt: 2_000,
  durationMs: 1_999,
};

describe('PdfCaptureEnvironmentPanel', () => {
  it('renders session badge, detail groups, and user agent', () => {
    render(<PdfCaptureEnvironmentPanel environment={environment} />);

    expect(screen.getByText('Captured environment')).toBeInTheDocument();
    expect(screen.getByText('Session metadata')).toBeInTheDocument();
    expect(screen.getByText('System details')).toBeInTheDocument();
    expect(screen.getByText('macOS 15.0')).toBeInTheDocument();
    expect(screen.getByText('Chrome 120')).toBeInTheDocument();
    expect(screen.getByText('en-US')).toBeInTheDocument();
    expect(screen.getByText('1280 × 800')).toBeInTheDocument();
    expect(screen.getByText('User agent string')).toBeInTheDocument();
    expect(screen.getByText(environment.userAgent)).toBeInTheDocument();
  });

  it('handles null OS and browser versions', () => {
    render(
      <PdfCaptureEnvironmentPanel
        environment={{
          ...environment,
          os: { ...environment.os, version: null },
          browser: { ...environment.browser, version: null },
        }}
      />,
    );

    expect(screen.getByText('macOS')).toBeInTheDocument();
    expect(screen.getByText('Chrome')).toBeInTheDocument();
  });
});
