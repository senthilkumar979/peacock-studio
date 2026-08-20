import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import { FlowDocQuickGlance } from './FlowDocQuickGlance';

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: vi.fn(() => false),
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'local'),
}));

vi.mock('@/hooks/useWorkflowArtifacts', () => ({
  useDocumentArtifactStatuses: vi.fn(() => ({ statuses: [], isLoading: false })),
}));

const captureEnvironment: FlowCaptureEnvironment = {
  userAgent: 'Mozilla/5.0',
  locale: 'en-US',
  languages: ['en-US'],
  timezone: 'UTC',
  platform: 'MacIntel',
  os: { family: 'macos', name: 'macOS', version: '14' },
  browser: { family: 'chrome', name: 'Chrome', version: '120' },
  device: { category: 'desktop', type: 'computer' },
  screen: {
    width: 1440,
    height: 900,
    availWidth: 1440,
    availHeight: 860,
    devicePixelRatio: 2,
  },
  viewport: { width: 1280, height: 720 },
  recordingStartedAt: 1,
  recordingEndedAt: 2,
  durationMs: 1,
};

describe('FlowDocQuickGlance', () => {
  it('returns null without deliverables or environment', () => {
    const { container } = render(<FlowDocQuickGlance documentId="doc-1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders environment chips from capture environment', () => {
    render(
      <FlowDocQuickGlance documentId="doc-1" captureEnvironment={captureEnvironment} />,
    );

    expect(screen.getByRole('region', { name: 'Flow quick glance' })).toBeInTheDocument();
    expect(screen.getByText(/Chrome 120/)).toBeInTheDocument();
    expect(screen.getByText(/macOS 14/)).toBeInTheDocument();
  });
});
