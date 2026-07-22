import { useMemo } from 'react';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import { CheckCircle2, CircleDashed, Loader2, Monitor, ScanSearch } from 'lucide-react';
import { isCloudSyncEnabled } from '@/cloud/config';
import { WORKFLOW_ARTIFACT_UI } from '@/constants/workflowArtifactUi';
import { useDocumentArtifactStatuses } from '@/hooks/useWorkflowArtifacts';
import { useSessionMode } from '@/hooks/useSessionMode';
import {
  WORKFLOW_ARTIFACT_TYPES,
  type WorkflowArtifactType,
} from '@/types/workflowArtifact';
import { buildCaptureDetailGroups } from '@/components/flow/captureEnvironmentDisplay';

interface FlowDocQuickGlanceProps {
  documentId: string;
  captureEnvironment?: FlowCaptureEnvironment | null;
}

const ARTIFACT_ORDER: WorkflowArtifactType[] = [
  WORKFLOW_ARTIFACT_TYPES.testCases,
  WORKFLOW_ARTIFACT_TYPES.playwright,
  WORKFLOW_ARTIFACT_TYPES.flowMap,
];

export const FlowDocQuickGlance = ({
  documentId,
  captureEnvironment,
}: FlowDocQuickGlanceProps) => {
  const sessionMode = useSessionMode();
  const { statuses, isLoading } = useDocumentArtifactStatuses(documentId);
  const showDeliverables = isCloudSyncEnabled() && sessionMode === 'cloud';

  const statusByType = useMemo(
    () => new Map(statuses.map((status) => [status.artifactType, status])),
    [statuses],
  );

  const environmentChips = useMemo(() => {
    if (!captureEnvironment) return [];

    const viewport = buildCaptureDetailGroups(captureEnvironment)[0]?.items.find(
      (item) => item.label === 'Viewport',
    )?.value;

    return [
      {
        id: 'browser',
        icon: ScanSearch,
        label: `${captureEnvironment.browser.name}${
          captureEnvironment.browser.version ? ` ${captureEnvironment.browser.version}` : ''
        }`,
      },
      {
        id: 'os',
        icon: Monitor,
        label: `${captureEnvironment.os.name}${
          captureEnvironment.os.version ? ` ${captureEnvironment.os.version}` : ''
        }`,
      },
      ...(viewport
        ? [{ id: 'viewport', icon: Monitor, label: viewport } as const]
        : []),
    ];
  }, [captureEnvironment]);

  if (!showDeliverables && environmentChips.length === 0) return null;

  return (
    <section
      aria-label="Flow quick glance"
      className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm sm:p-5"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Quick glance
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {showDeliverables ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Deliverables</span>
            {ARTIFACT_ORDER.map((artifactType) => {
              const config = WORKFLOW_ARTIFACT_UI[artifactType];
              const existing = statusByType.get(artifactType);

              return (
                <span
                  key={artifactType}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                    existing
                      ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                      : 'bg-slate-50 text-slate-600 ring-slate-200'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : existing ? (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {config.title}
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    {isLoading ? '…' : existing ? 'Ready' : 'Not generated'}
                  </span>
                </span>
              );
            })}
          </div>
        ) : null}

        {environmentChips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Environment</span>
            {environmentChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  <Icon className="h-3.5 w-3.5 text-peacock-600" aria-hidden />
                  {chip.label}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};
