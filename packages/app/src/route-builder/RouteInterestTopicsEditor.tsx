import { Plus, Trash2 } from "lucide-react";
import type { RouteInterestNode } from "@/types/route";
import { useRouteBuilderStore } from "@/store/routeBuilderStore";

interface RouteInterestTopicsEditorProps {
  node: RouteInterestNode;
}

export const RouteInterestTopicsEditor = ({
  node,
}: RouteInterestTopicsEditorProps) => {
  const addInterestTopic = useRouteBuilderStore(
    (state) => state.addInterestTopic,
  );
  const removeInterestTopic = useRouteBuilderStore(
    (state) => state.removeInterestTopic,
  );
  const updateInterestTopicLabel = useRouteBuilderStore(
    (state) => state.updateInterestTopicLabel,
  );
  const setInterestAllowMultiple = useRouteBuilderStore(
    (state) => state.setInterestAllowMultiple,
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Misc topics</p>
      {node.topics.map((topic) => (
        <div key={topic.id} className="flex items-center gap-2">
          <input
            type="text"
            value={topic.label}
            onChange={(event) =>
              updateInterestTopicLabel(node.id, topic.id, event.target.value)
            }
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
          />
          {node.topics.length > 2 ? (
            <button
              type="button"
              onClick={() => removeInterestTopic(node.id, topic.id)}
              className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove topic"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addInterestTopic(node.id)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add topic
      </button>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={node.allowMultiple}
          onChange={(event) =>
            setInterestAllowMultiple(node.id, event.target.checked)
          }
        />
        Allow multiple selections
      </label>
    </div>
  );
};
