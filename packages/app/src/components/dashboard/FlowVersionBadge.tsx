import { Tag } from "lucide-react";

interface FlowVersionBadgeProps {
  version: string;
}

export const FlowVersionBadge = ({ version }: FlowVersionBadgeProps) => {
  const trimmed = version.trim();

  if (!trimmed) {
    return (
      <span className="inline-flex items-center rounded-md border border-dashed border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-400">
        Unversioned
      </span>
    );
  }

  return (
    <span
      className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-md border border-brand-violet/25 bg-gradient-to-br from-brand-violet/10 via-white to-peacock-50/80 px-2.5 py-1 shadow-sm ring-1 ring-brand-violet/10 w-fit"
      title={trimmed}
    >
      <Tag className="h-3 w-3 shrink-0 text-brand-violet/70" aria-hidden />
      <span className="truncate font-mono text-xs font-semibold tracking-tight text-brand-violet w-fit">
        {trimmed}
      </span>
    </span>
  );
};
