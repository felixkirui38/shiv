"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateFaqPanel } from "@/components/admin/create-faq-panel";

export default function AdminFaqsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="FAQ"
        description="Manage frequently asked questions — fully CMS-driven."
        action={<CreateFaqPanel onCreated={handleCreated} />}
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/faqs"
        onRowClick={(row) => router.push(`/admin/faqs/${row.id}`)}
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
