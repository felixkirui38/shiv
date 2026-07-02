"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateCmsPagePanel } from "@/components/admin/create-cms-page-panel";

export default function AdminCmsPagesPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="CMS Pages"
        description="Manage static content pages served via /api/cms/pages/[slug]."
        action={<CreateCmsPagePanel onCreated={handleCreated} />}
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/cms/pages"
        onRowClick={(row) => router.push(`/admin/pages/${row.id}`)}
        columns={[
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug" },
          { key: "isPublished", label: "Published", render: (r) => (r.isPublished ? "Yes" : "No") },
          {
            key: "updatedAt",
            label: "Updated",
            render: (r) => new Date(r.updatedAt as string).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
