import { useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { getStepResourcesForStep, resolveResourceLabel, type StepResource } from '@peacock/shared';
import { Button, FieldInput, FormField } from '@/components/ui';
import { useFlowStore } from '@/store/flowStore';
import { hydrateResourceLabel } from '@/utils/hydrateResourceLabel';

interface StepResourceEditorProps {
  stepId: string;
}

export const StepResourceEditor = ({ stepId }: StepResourceEditorProps) => {
  const stepResources = useFlowStore((state) => state.stepResources);
  const addStepResource = useFlowStore((state) => state.addStepResource);
  const updateStepResource = useFlowStore((state) => state.updateStepResource);
  const removeStepResource = useFlowStore((state) => state.removeStepResource);
  const [draftUrl, setDraftUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resources = getStepResourcesForStep(stepResources, stepId);

  const handleAdd = () => {
    try {
      const id = addStepResource(stepId, draftUrl);
      if (id) {
        const added = useFlowStore.getState().stepResources.find((item) => item.id === id);
        if (added) void hydrateResourceLabel(id, added.url);
      }
      setDraftUrl('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL');
    }
  };

  const handleUpdate = (resource: StepResource, url: string) => {
    try {
      updateStepResource(resource.id, url);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL');
    }
  };

  return (
    <div className="space-y-3 px-1">
      <FormField
        label="Resources"
        hint="Add links learners can open alongside this step."
        error={error ?? undefined}
      >
        <div className="flex gap-2">
          <FieldInput
            value={draftUrl}
            onChange={(event) => {
              setDraftUrl(event.target.value);
              setError(null);
            }}
            placeholder="https://example.com/resource"
            hasError={Boolean(error)}
          />
          <Button type="button" variant="secondary" onClick={handleAdd} disabled={!draftUrl.trim()}>
            Add
          </Button>
        </div>
      </FormField>

      {resources.length > 0 ? (
        <ul className="space-y-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2"
            >
              <ExternalLink className="mt-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-xs font-medium text-slate-600">
                  {resolveResourceLabel(resource)}
                </p>
                <FieldInput
                  value={resource.url}
                  onChange={(event) => handleUpdate(resource, event.target.value)}
                  onBlur={() => void hydrateResourceLabel(resource.id, resource.url)}
                  className="text-xs"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStepResource(resource.id)}
                aria-label="Remove resource"
              >
                <Trash2 className="h-4 w-4 text-slate-500" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">No resources added yet.</p>
      )}
    </div>
  );
};
