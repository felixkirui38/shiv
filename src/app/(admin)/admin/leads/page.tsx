"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map((s) => ({
  value: s,
  label: s,
}));

export default function AdminLeadsPage() {
  return (
    <div>
      <AdminPageHeader title="Leads" description="Sales pipeline — track and convert insurance leads." />
      <AdminDataTable
        apiPath="/api/admin/leads"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "status", label: "Status" },
          { key: "source", label: "Source" },
          { key: "productType", label: "Product" },
        ]}
        statusOptions={LEAD_STATUSES}
        bulkDelete
        exportFilename="leads"
      />
    </div>
  );
}
