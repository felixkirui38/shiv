"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileQuestion, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "PENDING_PAYMENT",
  "PAID",
  "POLICY_ISSUED",
  "EXPIRED",
  "CANCELLED",
].map((s) => ({ value: s, label: s.replace(/_/g, " ") }));

const QUICK_ACTION_STATUSES = new Set(["SUBMITTED", "PENDING_REVIEW"]);

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [actingId, setActingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  async function runQuickAction(
    id: string,
    action: "approve" | "reject" | "request_documents"
  ) {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) refresh();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Insurance Applications"
        description="Review, approve, or reject customer insurance applications."
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/applications"
        onRowClick={(row) => router.push(`/admin/applications/${row.id}`)}
        renderActions={(row) => {
          if (!QUICK_ACTION_STATUSES.has(String(row.status))) {
            return <span className="text-xs text-slate-400">—</span>;
          }
          const busy = actingId === row.id;
          return (
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 px-2 text-xs"
                disabled={busy}
                onClick={() => runQuickAction(row.id, "approve")}
              >
                <Check className="size-3.5" /> Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 px-2 text-xs"
                disabled={busy}
                onClick={() => runQuickAction(row.id, "request_documents")}
              >
                <FileQuestion className="size-3.5" /> Docs
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 px-2 text-xs text-red-600"
                disabled={busy}
                onClick={() => runQuickAction(row.id, "reject")}
              >
                <X className="size-3.5" /> Reject
              </Button>
            </div>
          );
        }}
        columns={[
          { key: "applicationNumber", label: "Application #" },
          { key: "product", label: "Product" },
          { key: "customer", label: "Customer" },
          { key: "status", label: "Status" },
          {
            key: "premium",
            label: "Premium",
            render: (r) => `KES ${Number(r.premium).toLocaleString()}`,
          },
          { key: "orderNumber", label: "Order" },
        ]}
        statusOptions={STATUSES}
        exportFilename="applications"
      />
    </div>
  );
}
