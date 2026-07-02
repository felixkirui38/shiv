"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const QUOTE_STATUSES = ["DRAFT", "PENDING", "SENT", "ACCEPTED", "EXPIRED", "CONVERTED"].map((s) => ({
  value: s,
  label: s,
}));

export default function AdminQuotesPage() {
  const router = useRouter();

  return (
    <div>
      <AdminPageHeader
        title="Quotes"
        description="Wizard quotes from the online quote flow."
      />
      <AdminDataTable
        apiPath="/api/admin/quotes"
        onRowClick={(row) => router.push(`/admin/quotes/${row.id}`)}
        columns={[
          { key: "quoteNumber", label: "Quote #" },
          { key: "product", label: "Product" },
          { key: "customer", label: "Customer" },
          { key: "status", label: "Status" },
          { key: "premium", label: "Premium", render: (r) => `KES ${Number(r.premium).toLocaleString()}` },
          { key: "step", label: "Step" },
          { key: "createdAt", label: "Created", render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
        ]}
        statusOptions={QUOTE_STATUSES}
        exportFilename="quotes"
      />
    </div>
  );
}
