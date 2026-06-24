"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminCustomersPage() {
  return (
    <div>
      <AdminPageHeader title="Customers" description="Manage customer accounts, policies, and claims history." />
      <AdminDataTable
        apiPath="/api/admin/customers"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "status", label: "Status" },
          { key: "policies", label: "Policies" },
          { key: "claims", label: "Claims" },
          { key: "createdAt", label: "Joined", render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
        ]}
        exportFilename="customers"
      />
    </div>
  );
}
