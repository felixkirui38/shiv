"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminFaqsPage() {
  return (
    <div>
      <AdminPageHeader title="FAQ" description="Manage frequently asked questions — fully CMS-driven." />
      <AdminDataTable
        apiPath="/api/admin/faqs"
        columns={[
          { key: "question", label: "Question" },
          { key: "category", label: "Category" },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
          { key: "sortOrder", label: "Order" },
        ]}
        bulkDelete
      />
    </div>
  );
}
