import type { RouteFormNode } from '@/types/route';

interface RouteFormPanelProps {
  form: RouteFormNode;
  responses: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export const RouteFormPanel = ({ form, responses, onChange }: RouteFormPanelProps) => (
  <div className="mx-auto w-full max-w-xl rounded-2xl border border-sky-200 bg-white p-6 shadow-lg">
    <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Lead capture</p>
    <h2 className="mt-2 text-xl font-bold text-slate-900">{form.title}</h2>
    {form.description ? <p className="mt-2 text-sm text-slate-600">{form.description}</p> : null}
    <div className="mt-5 space-y-4">
      {form.fields.map((field) => (
        <label key={field.id} className="block">
          <span className="text-sm font-medium text-slate-700">
            {field.label}
            {field.required ? <span className="text-red-500"> *</span> : null}
          </span>
          {field.type === 'textarea' ? (
            <textarea
              value={responses[field.id] ?? ''}
              onChange={(event) => onChange(field.id, event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500"
            />
          ) : (
            <input
              type={field.type === 'email' ? 'email' : 'text'}
              value={responses[field.id] ?? ''}
              onChange={(event) => onChange(field.id, event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500"
            />
          )}
        </label>
      ))}
    </div>
  </div>
);
