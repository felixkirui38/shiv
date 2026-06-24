"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminAuditLogsPage() {
  return (
    <div>
      <AdminPageHeader title="Audit Logs" description="Complete audit trail of all CMS and system actions." />
      <AdminDataTable
        apiPath="/api/admin/audit-logs"
        columns={[
          { key: "action", label: "Action" },
          { key: "entity", label: "Entity" },
          { key: "entityId", label: "Entity ID" },
          { key: "user", label: "User" },
          { key: "createdAt", label: "Timestamp", render: (r) => new Date(r.createdAt as string).toLocaleString() },
        ]}
        exportFilename="audit-logs"
      />
    </div>
  );
}
