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
    <label className="block text-sm text-slate-900">
      <span className="font-semibold text-slate-900">Tour goal</span>
      <p className="mt-1 text-sm text-slate-600">
        {personaName
          ? `Why is ${personaName} taking this tour? Shown on the intro slide.`
          : 'Select a persona first, then describe why they are taking this tour.'}
      </p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        disabled={!personaName}
        placeholder="e.g. Reduce time spent on manual user provisioning"
        className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      />
    </label>
    {showLiveWarning && !value.trim() ? (
      <p className="mt-2 text-sm text-amber-700">
        Add a tour goal before setting this tour to Live.
      </p>
    ) : null}
  </div>
);
