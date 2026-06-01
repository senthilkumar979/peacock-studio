interface RouteCanvasBadgesProps {
  isEntry: boolean;
  warningCount: number;
}

export const RouteCanvasBadges = ({ isEntry, warningCount }: RouteCanvasBadgesProps) => (
  <div className="absolute -top-2 left-3 flex gap-1">
    {isEntry ? (
      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
        Start
      </span>
    ) : null}
    {warningCount > 0 ? (
      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
        {warningCount} issue{warningCount === 1 ? '' : 's'}
      </span>
    ) : null}
  </div>
);
