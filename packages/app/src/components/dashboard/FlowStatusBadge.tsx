import type { FlowDocumentStatus } from "@/types/savedFlow";
import { CheckCircle, CircleAlert } from "lucide-react";

interface FlowStatusBadgeProps {
  status: FlowDocumentStatus;
}

export const FlowStatusBadge = ({ status }: FlowStatusBadgeProps) => {
  if (status === "live") {
    return (
      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
        <CheckCircle className="mr-1 h-3 w-3 text-emerald-800" aria-hidden />
        Live
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
      <CircleAlert className="mr-1 h-3 w-3 text-amber-800" aria-hidden />
      Draft
    </span>
  );
};
