import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import { buildCaptureDetailGroups } from './captureEnvironmentDisplay';

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
}));

vi.mock('@/components/workflow-artifacts/WorkflowArtifactTiles', () => ({
  WorkflowArtifactTiles: () => <div>Workflow deliverables</div>,
}));

vi.mock('@/player/FlowDetailsIntro', () => ({
  FlowDetailsIntro: (props: { title: string }) => <h2>{props.title}</h2>,
}));

import { FlowDetailsOverviewLayout } from './FlowDetailsOverviewLayout';
import { FlowDocChromeHeader } from './FlowDocChromeHeader';
import { FlowDocumentStatusSwitch } from './FlowDocumentStatusSwitch';
import { FlowDetailsContextPanel } from './FlowDetailsContextPanel';
import { CaptureEnvironmentPanel } from './CaptureEnvironmentPanel';
import { CaptureEnvironmentDashboard } from './CaptureEnvironmentDashboard';
import { FlowContextTabBar } from './FlowContextTabBar';
import { FlowDetailsMetadataCard } from './FlowDetailsMetadataCard';
import { CaptureDetailGroupCard } from './CaptureDetailGroupCard';
import { CaptureSessionBadge } from './CaptureSessionBadge';

const environment: FlowCaptureEnvironment = {
  userAgent: 'ua',
  locale: 'en-US',
  languages: ['en-US'],
  timezone: 'UTC',
  platform: 'MacIntel',
  os: { family: 'macos', name: 'macOS', version: '15' },
  browser: { family: 'chrome', name: 'Chrome', version: '120' },
  device: { category: 'desktop', type: 'desktop' },
  screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1050, devicePixelRatio: 2 },
  viewport: { width: 1280, height: 800 },
  recordingStartedAt: 1,
  recordingEndedAt: 2,
  durationMs: 1000,
};

describe('flow smoke', () => {
  it('FlowDetailsOverviewLayout shows title', () => {
    renderWithProviders(
      <FlowDetailsOverviewLayout
        title="Guide title"
        description="Desc"
        version="1.0"
        variant="doc"
      />,
    );
    expect(screen.getByText('Guide title')).toBeInTheDocument();
  });

  it('FlowDocChromeHeader shows title', () => {
    renderWithProviders(<FlowDocChromeHeader title="Chrome title" homeTo="/dashboard" />);
    expect(screen.getByText('Chrome title')).toBeInTheDocument();
  });

  it('FlowDocumentStatusSwitch shows Live', () => {
    renderWithProviders(
      <FlowDocumentStatusSwitch value="live" onChange={vi.fn()} />,
    );
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('FlowDetailsContextPanel shows environment heading', () => {
    renderWithProviders(
      <FlowDetailsContextPanel documentId="doc-1" captureEnvironment={environment} />,
    );
    expect(screen.getByText('Captured environment')).toBeInTheDocument();
  });

  it('CaptureEnvironmentPanel shows browser', () => {
    renderWithProviders(<CaptureEnvironmentPanel environment={environment} />);
    expect(screen.getByText('Captured environment')).toBeInTheDocument();
    expect(screen.getByText('Chrome 120')).toBeInTheDocument();
  });

  it('CaptureEnvironmentDashboard shows Browser label', () => {
    renderWithProviders(<CaptureEnvironmentDashboard environment={environment} />);
    expect(screen.getByText('Browser')).toBeInTheDocument();
  });

  it('FlowContextTabBar shows Overview', () => {
    renderWithProviders(
      <FlowContextTabBar
        activeTab="deliverables"
        onTabChange={vi.fn()}
        showDeliverables
        showSession
      />,
    );
    expect(screen.getByRole('button', { name: 'Deliverables' })).toBeInTheDocument();
  });

  it('FlowDetailsMetadataCard renders with environment', () => {
    renderWithProviders(
      <FlowDetailsMetadataCard documentId="doc-1" captureEnvironment={environment} />,
    );
    expect(screen.getByText('Captured environment')).toBeInTheDocument();
  });

  it('CaptureDetailGroupCard shows group title', () => {
    const groups = buildCaptureDetailGroups(environment);
    const group = groups[0]!;
    renderWithProviders(<CaptureDetailGroupCard group={group} />);
    expect(screen.getByText(group.title)).toBeInTheDocument();
  });

  it('CaptureSessionBadge renders children', () => {
    renderWithProviders(<CaptureSessionBadge>Session tag</CaptureSessionBadge>);
    expect(screen.getByText('Session tag')).toBeInTheDocument();
  });
});
