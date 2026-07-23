import { FieldInput, FieldTextarea, FormField } from '@/components/ui';
import type { RouteFormNode } from '@/types/route';

interface RouteFormPanelProps {
  form: RouteFormNode;
  responses: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

/** Sky focus keeps route-learner lead-capture branding (important beats Field* defaults). */
const skyFieldClassName = 'focus:!border-sky-300 focus:!ring-sky-500';

export const RouteFormPanel = ({ form, responses, onChange }: RouteFormPanelProps) => (
  <div className="mx-auto w-full max-w-xl rounded-2xl border border-sky-200 bg-white p-6 shadow-lg">
    <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Lead capture</p>
    <h2 className="mt-2 text-xl font-bold text-slate-900">{form.title}</h2>
    {form.description ? <p className="mt-2 text-sm text-slate-600">{form.description}</p> : null}
    <div className="mt-5 space-y-4">
      {form.fields.map((field) => (
        <FormField
          key={field.id}
          label={field.required ? `${field.label} *` : field.label}
        >
          {field.type === 'textarea' ? (
            <FieldTextarea
              value={responses[field.id] ?? ''}
              onChange={(event) => onChange(field.id, event.target.value)}
              rows={3}
              className={skyFieldClassName}
            />
          ) : (
            <FieldInput
              type={field.type === 'email' ? 'email' : 'text'}
              value={responses[field.id] ?? ''}
              onChange={(event) => onChange(field.id, event.target.value)}
              className={skyFieldClassName}
            />
          )}
        </FormField>
      ))}
    </div>
  </div>
);
