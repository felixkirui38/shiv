"use client";

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

export default function AdminApplicationsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Insurance Applications"
        description="Review, approve, or reject customer insurance applications."
      />
      <AdminDataTable
        apiPath="/api/admin/applications"
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
