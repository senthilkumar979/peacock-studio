interface CaptureSessionBadgeProps {
  children: string | string[];
  variant?: "default" | "muted" | "dark" | "mono";
  className?: string;
}

const VARIANT_CLASSES: Record<
  NonNullable<CaptureSessionBadgeProps["variant"]>,
  string
> = {
  default: "bg-peacock-50 text-peacock-900 ring-peacock-100/90",
  muted: "bg-slate-100 text-slate-700 ring-slate-200/90",
  dark: "bg-white/10 text-white ring-white/15",
  mono: "bg-slate-900/5 font-mono text-slate-700 ring-slate-200/90",
};

export const CaptureSessionBadge = ({
  children,
  variant = "default",
  className = "",
}: CaptureSessionBadgeProps) => {
  const isMono = variant === "mono";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${VARIANT_CLASSES[variant]} ${
        isMono
          ? "rounded-lg px-3 py-1.5 text-[11px] font-medium leading-relaxed"
          : ""
      } ${className}`}
    >
      <span className={isMono ? "break-all" : "truncate"}>{children}</span>
    </span>
  );
};

interface CaptureSessionBadgeListProps {
  label: string;
  value: string;
  splitOnComma?: boolean;
}

export const CaptureSessionBadgeList = ({
  label,
  value,
  splitOnComma = false,
}: CaptureSessionBadgeListProps) => {
  const values =
    splitOnComma && value.includes(",")
      ? value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
      : [value];

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((badgeValue) => (
        <CaptureSessionBadge
          key={`${label}-${badgeValue}`}
          variant={values.length > 1 ? "muted" : "default"}
        >
          {badgeValue}
        </CaptureSessionBadge>
      ))}
    </div>
  );
};
