import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyFlowState } from "@/components/EmptyFlowState";
import { PeacockStudioLoader } from "@/components/PeacockStudioLoader";
import { usePersistRoute } from "@/hooks/usePersistRoute";
import { useSavedRoute } from "@/hooks/useSavedRoute";
import { listFlowSummaries } from "@/services/flowLibraryService";
import { RouteBuilderToolbar } from "@/route-builder/RouteBuilderToolbar";
import { RouteCanvas } from "@/route-builder/RouteCanvas";
import { RouteCanvasToolbar } from "@/route-builder/RouteCanvasToolbar";
import { RouteListView } from "@/route-builder/RouteListView";
import { RouteNodeDetailsPanel } from "@/route-builder/RouteNodeDetailsPanel";
import { RouteValidationBanner } from "@/route-builder/RouteValidationBanner";
import { useRouteBuilderStore } from "@/store/routeBuilderStore";
import type { RouteBuilderViewMode } from "@/types/route";
import type { SavedFlowSummary } from "@/types/savedFlow";
import { validateRoute } from "@/utils/routeValidation";

export const RouteBuilder = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const { route, isLoading, isLoaded, error } = useSavedRoute(routeId);
  const [summaries, setSummaries] = useState<SavedFlowSummary[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [viewMode, setViewMode] = useState<RouteBuilderViewMode>("canvas");
  const builderRoute = useRouteBuilderStore((state) => state.route);
  const setSelectedNodeId = useRouteBuilderStore(
    (state) => state.setSelectedNodeId,
  );

  const validationIssues = useMemo(
    () => (builderRoute ? validateRoute(builderRoute) : []),
    [builderRoute],
  );

  usePersistRoute(Boolean(routeId && isLoaded));

  useEffect(() => {
    void listFlowSummaries()
      .then(setSummaries)
      .finally(() => setIsLibraryLoading(false));
  }, []);

  if (!routeId) {
    return (
      <EmptyFlowState
        title="Invalid route"
        description="Open a route from your dashboard or create a new one."
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          {error}{" "}
          <Link to="/" className="font-medium underline">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !isLoaded || !route) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading route builder…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/80">
      <RouteBuilderToolbar
        routeId={routeId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <main
        className={`mx-auto w-full flex-1 ${viewMode === "canvas" ? "max-w-10xl px-4 py-6" : ""}`}
      >
        {isLibraryLoading && viewMode === "list" ? (
          <p className="mx-auto max-w-xl px-6 py-4 text-sm text-slate-500 sm:px-12 md:px-20">
            Loading demo library…
          </p>
        ) : null}

        {viewMode === "list" ? (
          <RouteListView
            summaries={summaries}
            validationIssues={validationIssues}
            onSelectValidationNode={(nodeId) => {
              setSelectedNodeId(nodeId);
              setViewMode("canvas");
            }}
          />
        ) : (
          <>
            {isLibraryLoading ? (
              <p className="mb-4 text-sm text-slate-500">
                Loading demo library…
              </p>
            ) : null}
            <div className="grid min-h-[620px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex min-h-[620px] flex-col gap-3">
                <RouteValidationBanner
                  issues={validationIssues}
                  onSelectNode={(nodeId) => {
                    setSelectedNodeId(nodeId);
                    setViewMode("canvas");
                  }}
                />
                <RouteCanvasToolbar />
                <RouteCanvas />
              </div>
              <RouteNodeDetailsPanel summaries={summaries} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};
