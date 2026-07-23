import { Plus, Trash2 } from 'lucide-react';
import { Button, FieldInput } from '@/components/ui';
import type { RouteInterestNode } from '@/types/route';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';

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
          <FieldInput
            type="text"
            value={topic.label}
            onChange={(event) =>
              updateInterestTopicLabel(node.id, topic.id, event.target.value)
            }
            className="min-w-0 flex-1"
            aria-label="Topic label"
          />
          {node.topics.length > 2 ? (
            <Button
              variant="ghostDanger"
              size="icon"
              onClick={() => removeInterestTopic(node.id, topic.id)}
              aria-label="Remove topic"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() => addInterestTopic(node.id)}
        className="inline-flex items-center gap-1.5 border-dashed"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add topic
      </Button>
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
