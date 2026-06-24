import { cn } from "@/lib/utils";
import {
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_STYLES,
} from "@/lib/claims/types";
import type { ClaimStatus } from "@/generated/prisma/client";

export function ClaimStatusBadge({ status }: { status: string }) {
  const label =
    CLAIM_STATUS_LABELS[status as ClaimStatus] ?? status.replace(/_/g, " ");
  const style =
    CLAIM_STATUS_STYLES[status as ClaimStatus] ?? "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style
      )}
    >
      {label}
    </span>
  );
}
