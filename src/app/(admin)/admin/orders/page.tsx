"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "PENDING_PAYMENT",
  "PAID",
  "POLICY_GENERATED",
  "EXPIRED",
  "CANCELLED",
  "REJECTED",
].map((s) => ({ value: s, label: s.replace(/_/g, " ") }));

export default function AdminOrdersPage() {
  const router = useRouter();

  return (
    <div>
      <AdminPageHeader
        title="Insurance Orders"
        description="Track insurance purchase orders from application to policy issuance."
      />
      <AdminDataTable
        apiPath="/api/admin/orders"
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
        columns={[
          { key: "orderNumber", label: "Order #" },
          { key: "insuranceName", label: "Product" },
          { key: "customer", label: "Customer" },
          { key: "application", label: "Application" },
          { key: "policy", label: "Policy" },
          { key: "status", label: "Status" },
          {
            key: "total",
            label: "Total",
            render: (r) => `KES ${Number(r.total).toLocaleString()}`,
          },
        ]}
        statusOptions={STATUSES}
        exportFilename="orders"
      />
    </div>
  );
}
