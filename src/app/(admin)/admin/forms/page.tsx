"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateFormPanel } from "@/components/admin/create-form-panel";

export default function AdminFormsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dynamic Forms"
        description="Form definitions and submission tracking."
        action={<CreateFormPanel onCreated={handleCreated} />}
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/forms"
        onRowClick={(row) => router.push(`/admin/forms/${row.id}`)}
        columns={[
          { key: "name", label: "Form" },
          { key: "slug", label: "Slug" },
          { key: "fields", label: "Fields" },
          {
            key: "submissions",
            label: "Submissions",
            render: (r) => (
              <Link
                href={`/admin/forms/${r.id}/submissions`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {String(r.submissions)}
              </Link>
            ),
          },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
          { key: "version", label: "Version" },
        ]}
      />
    </div>
  );
}
