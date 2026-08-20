import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowCaptureEnvironment } from '@peacock/shared';

vi.mock('@react-pdf/renderer', async () => import('./reactPdfTestMock'));

import { PdfFlowDetailsPage } from './PdfFlowDetailsPage';

const environment: FlowCaptureEnvironment = {
  userAgent: 'Mozilla/5.0',
  locale: 'en-GB',
  languages: ['en-GB'],
  timezone: 'Europe/London',
  platform: 'MacIntel',
  os: { family: 'macos', name: 'macOS', version: '14' },
  browser: { family: 'safari', name: 'Safari', version: '17' },
  device: { category: 'desktop', type: 'computer' },
  screen: {
    width: 1512,
    height: 982,
    availWidth: 1512,
    availHeight: 940,
    devicePixelRatio: 2,
  },
  viewport: { width: 1200, height: 700 },
  recordingStartedAt: 10,
  recordingEndedAt: 20,
  durationMs: 10,
};

describe('PdfFlowDetailsPage', () => {
  it('renders session metadata eyebrow, header, panel, and footer', () => {
    render(
      <PdfFlowDetailsPage
        flowTitle="Onboarding flow"
        environment={environment}
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.getByText('Onboarding flow')).toBeInTheDocument();
    expect(screen.getAllByText('Session metadata').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Captured environment')).toBeInTheDocument();
    expect(screen.getByText('Safari 17')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-image')).toHaveAttribute(
      'data-src',
      'https://example.com/logo.png',
    );
  });
});
