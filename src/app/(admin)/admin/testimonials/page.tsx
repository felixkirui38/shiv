"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminTestimonialsPage() {
  return (
    <div>
      <AdminPageHeader title="Testimonials" description="Customer testimonials displayed on the website." />
      <AdminDataTable
        apiPath="/api/admin/testimonials"
        columns={[
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
          { key: "company", label: "Company" },
          { key: "rating", label: "Rating" },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
        ]}
        bulkDelete
      />
    </div>
  );
}
