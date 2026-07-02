"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminCareersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Career Applications"
        description="Review job applications submitted from the careers page."
      />
      <AdminDataTable
        apiPath="/api/admin/careers"
        onRowClick={(row) => router.push(`/admin/careers/${row.id}`)}
        columns={[
          { key: "name", label: "Applicant" },
          { key: "email", label: "Email" },
          { key: "position", label: "Position" },
          { key: "status", label: "Status" },
          {
            key: "hasResume",
            label: "Resume",
            render: (r) => (r.hasResume ? "Yes" : "No"),
          },
          {
            key: "createdAt",
            label: "Applied",
            render: (r) => new Date(r.createdAt as string).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
