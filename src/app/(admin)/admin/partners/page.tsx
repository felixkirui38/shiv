"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminPartnersPage() {
  return (
    <div>
      <AdminPageHeader title="Partners" description="Insurance partners and underwriter logos." />
      <AdminDataTable
        apiPath="/api/admin/partners"
        columns={[
          { key: "name", label: "Name" },
          { key: "website", label: "Website" },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
          { key: "sortOrder", label: "Order" },
        ]}
        bulkDelete
      />
    </div>
  );
}
