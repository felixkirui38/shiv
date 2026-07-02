"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const POLICY_STATUSES = [
  "DRAFT", "PENDING_PAYMENT", "ACTIVE", "EXPIRED", "CANCELLED", "LAPSED", "RENEWED",
].map((s) => ({ value: s, label: s.replace(/_/g, " ") }));

export default function AdminPoliciesPage() {
  const router = useRouter();

  return (
    <div>
      <AdminPageHeader title="Policies" description="View and manage all insurance policies." />
      <AdminDataTable
        apiPath="/api/admin/policies"
        onRowClick={(row) => router.push(`/admin/policies/${row.id}`)}
        columns={[
          { key: "policyNumber", label: "Policy #" },
          { key: "customer", label: "Customer" },
          { key: "product", label: "Product" },
          { key: "status", label: "Status" },
          { key: "premium", label: "Premium", render: (r) => `KES ${Number(r.premium).toLocaleString()}` },
          { key: "endDate", label: "End Date" },
        ]}
        statusOptions={POLICY_STATUSES}
        exportFilename="policies"
      />
    </div>
  );
}
