"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateTestimonialPanel } from "@/components/admin/create-testimonial-panel";

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Testimonials"
        description="Customer testimonials displayed on the website."
        action={<CreateTestimonialPanel onCreated={handleCreated} />}
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/testimonials"
        onRowClick={(row) => router.push(`/admin/testimonials/${row.id}`)}
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
