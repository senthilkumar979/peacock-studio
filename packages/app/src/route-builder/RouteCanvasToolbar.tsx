import {
  GitBranch,
  Layers,
  ClipboardList,
  Redo2,
  Sparkles,
  Undo2,
} from "lucide-react";
import { useRouteBuilderStore } from "@/store/routeBuilderStore";

export const RouteCanvasToolbar = () => {
  const addChapter = useRouteBuilderStore((state) => state.addChapter);
  const addBranchNode = useRouteBuilderStore((state) => state.addBranchNode);
  const addFormNode = useRouteBuilderStore((state) => state.addFormNode);
  const addInterestNode = useRouteBuilderStore(
    (state) => state.addInterestNode,
  );
  const undo = useRouteBuilderStore((state) => state.undo);
  const redo = useRouteBuilderStore((state) => state.redo);
  const canUndo = useRouteBuilderStore((state) => state.past.length > 0);
  const canRedo = useRouteBuilderStore((state) => state.future.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Add node
      </span>
      <button
        type="button"
        onClick={addChapter}
        className={TOOLBAR_BUTTON_CLASS}
      >
        <Layers className="h-4 w-4" aria-hidden />
        Chapter
      </button>
      <button
        type="button"
        onClick={addBranchNode}
        className={TOOLBAR_BUTTON_CLASS}
      >
        <GitBranch className="h-4 w-4" aria-hidden />
        Branch
      </button>
      <button
        type="button"
        onClick={addInterestNode}
        className={TOOLBAR_BUTTON_CLASS}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Misc
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const TOOLBAR_BUTTON_CLASS =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white";
