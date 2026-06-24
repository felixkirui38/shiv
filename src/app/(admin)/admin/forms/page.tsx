"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminFormsPage() {
  return (
    <div>
      <AdminPageHeader title="Dynamic Forms" description="Form definitions and submission tracking." />
      <AdminDataTable
        apiPath="/api/admin/forms"
        columns={[
          { key: "name", label: "Form" },
          { key: "slug", label: "Slug" },
          { key: "fields", label: "Fields" },
          { key: "submissions", label: "Submissions" },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
          { key: "version", label: "Version" },
        ]}
      />
    </div>
  );
}
