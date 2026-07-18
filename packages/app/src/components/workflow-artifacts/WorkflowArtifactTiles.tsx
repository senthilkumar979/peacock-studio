import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { CloudAuthActions } from "@/components/auth/CloudAuthActions";
import { GenericErrorPage } from "@/components/errors/GenericErrorPage";
import { WORKFLOW_ARTIFACT_UI } from "@/constants/workflowArtifactUi";
import { useDocumentArtifactStatuses } from "@/hooks/useWorkflowArtifacts";
import { useSessionMode } from "@/hooks/useSessionMode";
import {
  WORKFLOW_ARTIFACT_TYPES,
  type WorkflowArtifactType,
} from "@/types/workflowArtifact";
import { logAppError } from "@/utils/appError";

interface WorkflowArtifactTilesProps {
  documentId: string;
}

const ARTIFACT_ORDER: WorkflowArtifactType[] = [
  WORKFLOW_ARTIFACT_TYPES.testCases,
  WORKFLOW_ARTIFACT_TYPES.playwright,
  WORKFLOW_ARTIFACT_TYPES.flowMap,
];

const ARTIFACT_ACCENTS: Record<
  WorkflowArtifactType,
  { gradient: string; surface: string; ring: string }
> = {
  [WORKFLOW_ARTIFACT_TYPES.testCases]: {
    gradient: "from-emerald-500 to-teal-600",
    surface: "from-emerald-50/90 to-teal-50/50",
    ring: "ring-emerald-100/80",
  },
  [WORKFLOW_ARTIFACT_TYPES.playwright]: {
    gradient: "from-violet-500 to-purple-600",
    surface: "from-violet-50/90 to-purple-50/50",
    ring: "ring-violet-100/80",
  },
  [WORKFLOW_ARTIFACT_TYPES.flowMap]: {
    gradient: "from-amber-500 to-orange-600",
    surface: "from-amber-50/90 to-orange-50/50",
    ring: "ring-amber-100/80",
  },
};

export const WorkflowArtifactTiles = ({
  documentId,
}: WorkflowArtifactTilesProps) => {
  const sessionMode = useSessionMode();
  const { statuses, isLoading, error, refresh, generate } =
    useDocumentArtifactStatuses(documentId);
  const [pendingType, setPendingType] = useState<WorkflowArtifactType | null>(
    null,
  );
  const [hasGenerateError, setHasGenerateError] = useState(false);

  const statusByType = useMemo(
    () => new Map(statuses.map((status) => [status.artifactType, status])),
    [statuses],
  );

  const canGenerate = sessionMode === "cloud";

  const handleGenerate = async (artifactType: WorkflowArtifactType) => {
    setHasGenerateError(false);
    setPendingType(artifactType);
    try {
      await generate(artifactType);
    } catch (generateError) {
      logAppError("Failed to generate workflow artifact", generateError);
      setHasGenerateError(true);
    } finally {
      setPendingType(null);
    }
  };

  if (!canGenerate) {
    return (
      <CloudAuthActions
        variant="callout"
        title="Workflow deliverables"
        message="Sign in to generate test cases, Playwright specs, and flow maps from this flow."
      />
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 xl:grid-cols-1">
        {ARTIFACT_ORDER.map((artifactType) => {
          const config = WORKFLOW_ARTIFACT_UI[artifactType];
          const Icon = config.icon;
          const accent = ARTIFACT_ACCENTS[artifactType];
          const existing = statusByType.get(artifactType);
          const isPending = pendingType === artifactType;

          return (
            <li
              key={artifactType}
              className={`group flex flex-col gap-4 rounded-2xl border border-white/80 bg-gradient-to-br ${accent.surface} p-4 shadow-sm ring-1 ${accent.ring} transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center xl:flex-col xl:items-stretch`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`inline-flex shrink-0 rounded-xl bg-gradient-to-br ${accent.gradient} p-2.5 text-white shadow-md shadow-slate-900/10`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 xl:mt-4">
                    {config.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 md:line-clamp-2 xl:line-clamp-none xl:text-sm">
                    {config.description}
                  </p>
                </div>
                <div className="shrink-0 md:pl-1 xl:pl-0">
                  {isLoading ? (
                    <p className="text-xs text-slate-500">Checking…</p>
                  ) : existing ? (
                    <Link
                      to={config.getDetailPath(documentId)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200/80 transition hover:bg-white md:w-auto xl:w-full"
                    >
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-600"
                        aria-hidden
                      />
                      Open
                      <ArrowUpRight
                        className="h-4 w-4 opacity-60"
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => void handleGenerate(artifactType)}
                      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r ${accent.gradient} px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60 md:min-w-[7.5rem] xl:w-full xl:min-w-0`}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : null}
                      Generate
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {error || hasGenerateError ? (
        <div className="mt-4">
          <GenericErrorPage
            compact
            onRetry={() => {
              setHasGenerateError(false);
              void refresh();
            }}
          />
        </div>
      ) : null}
    </>
  );
};
