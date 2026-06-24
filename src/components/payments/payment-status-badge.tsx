import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SUCCEEDED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-slate-100 text-slate-700",
  PARTIALLY_REFUNDED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  PAID: "bg-green-100 text-green-800",
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-100 text-blue-800",
  OVERDUE: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SUCCEEDED: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partial Refund",
  CANCELLED: "Cancelled",
  PAID: "Paid",
  DRAFT: "Draft",
  SENT: "Sent",
  OVERDUE: "Overdue",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
