import { Plus, Trash2 } from 'lucide-react';
import { Button, FieldInput, FieldSelect } from '@/components/ui';
import type { RouteFormFieldType, RouteFormNode } from '@/types/route';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';

interface RouteFormFieldsEditorProps {
  node: RouteFormNode;
}

export const RouteFormFieldsEditor = ({ node }: RouteFormFieldsEditorProps) => {
  const addFormField = useRouteBuilderStore((state) => state.addFormField);
  const removeFormField = useRouteBuilderStore((state) => state.removeFormField);
  const updateFormField = useRouteBuilderStore((state) => state.updateFormField);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Form fields</p>
      {node.fields.map((field) => (
        <div key={field.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
          <FieldInput
            type="text"
            value={field.label}
            onChange={(event) =>
              updateFormField(node.id, field.id, event.target.value, field.type, field.required)
            }
          />
          <div className="flex items-center gap-2">
            <FieldSelect
              value={field.type}
              onChange={(event) =>
                updateFormField(
                  node.id,
                  field.id,
                  field.label,
                  event.target.value as RouteFormFieldType,
                  field.required,
                )
              }
              className="w-auto px-2 py-1.5"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Long text</option>
            </FieldSelect>
            <label className="inline-flex items-center gap-1.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(event) =>
                  updateFormField(node.id, field.id, field.label, field.type, event.target.checked)
                }
              />
              Required
            </label>
            {node.fields.length > 1 ? (
              <Button
                variant="ghostDanger"
                className="ml-auto"
                onClick={() => removeFormField(node.id, field.id)}
                aria-label="Remove field"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addFormField(node.id)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add field
      </button>
    </div>
  );
};
