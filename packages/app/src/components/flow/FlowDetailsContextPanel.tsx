import { useState } from 'react';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import { Layers3, Radar } from 'lucide-react';
import { isCloudSyncEnabled } from '@/cloud/config';
import { CaptureEnvironmentDashboard } from '@/components/flow/CaptureEnvironmentDashboard';
import {
  FlowContextTabBar,
  type FlowContextTab,
} from '@/components/flow/FlowContextTabBar';
import { WorkflowArtifactTiles } from '@/components/workflow-artifacts/WorkflowArtifactTiles';

interface FlowDetailsContextPanelProps {
  documentId?: string;
  captureEnvironment?: FlowCaptureEnvironment | null;
}

export const FlowDetailsContextPanel = ({
  documentId,
  captureEnvironment,
}: FlowDetailsContextPanelProps) => {
  const showDeliverables = Boolean(documentId && isCloudSyncEnabled());
  const showSession = Boolean(captureEnvironment);

  const defaultTab: FlowContextTab = showDeliverables ? 'deliverables' : 'session';
  const [activeTab, setActiveTab] = useState<FlowContextTab>(defaultTab);

  if (!showDeliverables && !showSession) return null;

  const resolvedTab =
    activeTab === 'deliverables' && !showDeliverables
      ? 'session'
      : activeTab === 'session' && !showSession
        ? 'deliverables'
        : activeTab;

  const sectionTitle =
    resolvedTab === 'deliverables' ? 'Workflow deliverables' : 'Captured environment';
  const SectionIcon = resolvedTab === 'deliverables' ? Layers3 : Radar;
  const sectionDescription =
    resolvedTab === 'deliverables'
      ? 'QA artifacts generated on demand from your recorded steps.'
      : 'Browser, device, and locale snapshot from the recording session.';

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
      <div className="relative overflow-hidden border-b border-slate-900/10 bg-gradient-to-br from-slate-900 via-slate-900 to-peacock-950 px-5 py-5 sm:px-6">
        <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-peacock-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Flow intelligence
            </p>
            <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white sm:text-xl">
              <SectionIcon className="h-5 w-5 shrink-0 text-peacock-300" aria-hidden />
              {sectionTitle}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{sectionDescription}</p>
          </div>
          <div className="w-full shrink-0 xl:w-auto xl:min-w-[15rem]">
            <FlowContextTabBar
              activeTab={resolvedTab}
              onTabChange={setActiveTab}
              showDeliverables={showDeliverables}
              showSession={showSession}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4 sm:p-5">
        {resolvedTab === 'deliverables' && documentId ? (
          <WorkflowArtifactTiles documentId={documentId} />
        ) : null}
        {resolvedTab === 'session' && captureEnvironment ? (
          <CaptureEnvironmentDashboard environment={captureEnvironment} />
        ) : null}
      </div>
    </div>
  );
};

export function hasFlowDetailsMetadata(
  documentId?: string,
  captureEnvironment?: FlowCaptureEnvironment | null,
): boolean {
  const showDeliverables = Boolean(documentId && isCloudSyncEnabled());
  const showSession = Boolean(captureEnvironment);
  return showDeliverables || showSession;
}
