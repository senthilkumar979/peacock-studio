import type { ConsentCategoryId, ConsentCategoryMeta } from '@peacock/shared';

interface CookieCategoryToggleProps {
  category: ConsentCategoryMeta;
  enabled: boolean;
  onChange: (id: ConsentCategoryId, value: boolean) => void;
}

export const CookieCategoryToggle = ({
  category,
  enabled,
  onChange,
}: CookieCategoryToggleProps) => {
  const isLocked = category.required;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{category.label}</p>
        <p className="mt-1 text-xs text-slate-600">{category.description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${category.label}${isLocked ? ' (always on)' : ''}`}
        disabled={isLocked}
        onClick={() => onChange(category.id, !enabled)}
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          enabled ? 'bg-peacock-600' : 'bg-slate-300'
        } ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
