import { useMemo, useState } from "react";
import { Flag, Plus, Trash2 } from "lucide-react";
import { Button, FieldInput, FieldTextarea, FormField } from "@/components/ui";
import { AddPeacockModal } from "@/route-builder/AddPeacockModal";
import { RouteFormFieldsEditor } from "@/route-builder/RouteFormFieldsEditor";
import { RouteInterestTopicsEditor } from "@/route-builder/RouteInterestTopicsEditor";
import { RoutePeacockList } from "@/route-builder/RoutePeacockList";
import {
  getNodeConnectionSummary,
  useRouteBuilderStore,
} from "@/store/routeBuilderStore";
import type { SavedFlowSummary } from "@/types/savedFlow";
import {
  isBranchNode,
  isChapterNode,
  isFormNode,
  isInterestNode,
  type RouteNode,
} from "@/types/route";
import {
  getNodeValidationIssues,
  validateRoute,
} from "@/utils/routeValidation";

interface RouteNodeDetailsPanelProps {
  summaries: SavedFlowSummary[];
}

function getNodeTypeLabel(node: RouteNode): string {
  if (node.type === "chapter") return "Chapter";
  if (node.type === "branch") return "Branch";
  if (node.type === "form") return "Form";
  return "Misc";
}

export const RouteNodeDetailsPanel = ({
  summaries,
}: RouteNodeDetailsPanelProps) => {
  const route = useRouteBuilderStore((state) => state.route);
  const selectedNodeId = useRouteBuilderStore((state) => state.selectedNodeId);
  const deleteNode = useRouteBuilderStore((state) => state.deleteNode);
  const setEntryNodeId = useRouteBuilderStore((state) => state.setEntryNodeId);
  const updateChapter = useRouteBuilderStore((state) => state.updateChapter);
  const updateBranchNode = useRouteBuilderStore(
    (state) => state.updateBranchNode,
  );
  const updateFormNode = useRouteBuilderStore((state) => state.updateFormNode);
  const updateInterestNode = useRouteBuilderStore(
    (state) => state.updateInterestNode,
  );
  const addBranchOption = useRouteBuilderStore(
    (state) => state.addBranchOption,
  );
  const removeBranchOption = useRouteBuilderStore(
    (state) => state.removeBranchOption,
  );
  const updateBranchOptionLabel = useRouteBuilderStore(
    (state) => state.updateBranchOptionLabel,
  );
  const addPeacock = useRouteBuilderStore((state) => state.addPeacock);
  const removePeacock = useRouteBuilderStore((state) => state.removePeacock);
  const reorderPeacocks = useRouteBuilderStore(
    (state) => state.reorderPeacocks,
  );

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const summariesById = useMemo(
    () => new Map(summaries.map((summary) => [summary.id, summary])),
    [summaries],
  );

  const issues = useMemo(() => (route ? validateRoute(route) : []), [route]);

  if (!route || !selectedNodeId) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Select a node on the canvas to edit its details.
      </aside>
    );
  }

  const node = route.nodes.find((item) => item.id === selectedNodeId);
  if (!node) return null;

  const nodeIssues = getNodeValidationIssues(issues, node.id);
  const isEntry = route.entryNodeId === node.id;

  const updateTitleDescription = (title: string, description: string) => {
    if (isChapterNode(node)) updateChapter(node.id, title, description);
    else if (isBranchNode(node)) updateBranchNode(node.id, title, description);
    else if (isFormNode(node)) updateFormNode(node.id, title, description);
    else if (isInterestNode(node))
      updateInterestNode(node.id, title, description);
  };

  return (
    <aside className="flex min-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {getNodeTypeLabel(node)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {getNodeConnectionSummary(route, node.id)}
            </p>
          </div>
          {route.nodes.length > 1 ? (
            <Button
              variant="danger"
              className="border p-2"
              onClick={() => deleteNode(node.id)}
              aria-label="Delete node"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        {!isEntry ? (
          <button
            type="button"
            onClick={() => setEntryNodeId(node.id)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            Set as route start
          </button>
        ) : (
          <p className="mt-3 text-xs font-medium text-emerald-700">
            This is the route start node
          </p>
        )}
      </div>

      {nodeIssues.length > 0 ? (
        <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-800">
          {nodeIssues.map((issue) => (
            <p key={issue.id}>{issue.message}</p>
          ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <FormField label="Title">
          <FieldInput
            type="text"
            value={node.title}
            onChange={(event) =>
              updateTitleDescription(event.target.value, node.description)
            }
          />
        </FormField>

        <FormField label="Description">
          <FieldTextarea
            value={node.description}
            onChange={(event) =>
              updateTitleDescription(node.title, event.target.value)
            }
            rows={6}
          />
        </FormField>

        {isBranchNode(node) ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Branch options</p>
            {node.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <FieldInput
                  type="text"
                  value={option.label}
                  onChange={(event) =>
                    updateBranchOptionLabel(
                      node.id,
                      option.id,
                      event.target.value,
                    )
                  }
                  className="min-w-0 flex-1"
                />
                {node.options.length > 2 ? (
                  <Button
                    variant="ghostDanger"
                    onClick={() => removeBranchOption(node.id, option.id)}
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addBranchOption(node.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add option
            </button>
          </div>
        ) : null}

        {isFormNode(node) ? <RouteFormFieldsEditor node={node} /> : null}
        {isInterestNode(node) ? (
          <RouteInterestTopicsEditor node={node} />
        ) : null}

        {isChapterNode(node) ? (
          <div className="space-y-3">
            <RoutePeacockList
              peacocks={node.peacocks}
              summariesById={summariesById}
              onRemove={(peacockRefId) => removePeacock(node.id, peacockRefId)}
              onReorder={(from, to) => reorderPeacocks(node.id, from, to)}
            />
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-peacock-200 bg-peacock-50/40 px-3 py-2 text-sm font-medium text-peacock-800 hover:bg-peacock-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add demo
            </button>
            <AddPeacockModal
              isOpen={isPickerOpen}
              summaries={summaries}
              excludedDocumentIds={node.peacocks.map(
                (peacock) => peacock.documentId,
              )}
              onClose={() => setIsPickerOpen(false)}
              onSelect={(documentId) => addPeacock(node.id, documentId)}
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
};
