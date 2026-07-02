"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateStaffUserPanel } from "@/components/admin/create-staff-user-panel";

export default function AdminUsersPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Staff Users"
        description="Manage admin users, roles, and permissions."
        action={<CreateStaffUserPanel onCreated={handleCreated} />}
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/users"
        onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (r) => String(r.role).replace(/_/g, " ") },
          { key: "status", label: "Status" },
          {
            key: "createdAt",
            label: "Created",
            render: (r) => new Date(r.createdAt as string).toLocaleDateString(),
          },
        ]}
        exportFilename="staff"
      />
    </div>
  );
}
