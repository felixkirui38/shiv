"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((s) => ({
  value: s,
  label: s,
}));

export default function AdminInvoicesPage() {
  return (
    <div>
      <AdminPageHeader title="Invoices" description="Manage customer invoices and payment status." />
      <AdminDataTable
        apiPath="/api/admin/invoices"
        columns={[
          { key: "invoiceNumber", label: "Invoice #" },
          { key: "customer", label: "Customer" },
          { key: "status", label: "Status" },
          { key: "total", label: "Total", render: (r) => `${r.currency} ${Number(r.total).toLocaleString()}` },
          { key: "dueDate", label: "Due" },
        ]}
        statusOptions={INVOICE_STATUSES}
        exportFilename="invoices"
      />
    </div>
  );
}
