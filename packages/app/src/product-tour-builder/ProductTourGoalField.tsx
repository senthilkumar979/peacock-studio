import { FieldTextarea, FormField } from '@/components/ui';

interface ProductTourGoalFieldProps {
  value: string;
  personaName?: string;
  onChange: (value: string) => void;
  showLiveWarning?: boolean;
}

export const ProductTourGoalField = ({
  value,
  personaName,
  onChange,
  showLiveWarning = false,
}: ProductTourGoalFieldProps) => (
  <div className="relative z-10 border-t border-slate-100 bg-white px-5 py-5 sm:px-6">
    <FormField
      label="Tour goal"
      hint={
        personaName
          ? `Why is ${personaName} taking this tour? Shown on the intro slide.`
          : 'Select a persona first, then describe why they are taking this tour.'
      }
    >
      <FieldTextarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        disabled={!personaName}
        placeholder="e.g. Reduce time spent on manual user provisioning"
        className="rounded-xl border-slate-200 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-peacock-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      />
    </FormField>
    {showLiveWarning && !value.trim() ? (
      <p className="mt-2 text-sm text-amber-700">
        Add a tour goal before setting this tour to Live.
      </p>
    ) : null}
  </div>
);
