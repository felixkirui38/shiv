"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminUsersPage() {
  return (
    <div>
      <AdminPageHeader title="Staff Users" description="Manage admin users, roles, and permissions." />
      <AdminDataTable
        apiPath="/api/admin/users"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (r) => String(r.role).replace(/_/g, " ") },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created", render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
        ]}
        exportFilename="staff"
      />
    </div>
  );
}
