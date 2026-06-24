"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminMediaPage() {
  return (
    <div>
      <AdminPageHeader title="Media Library" description="Cloudinary-backed media assets for CMS content." />
      <AdminDataTable
        apiPath="/api/admin/media"
        columns={[
          { key: "name", label: "File" },
          { key: "type", label: "Type" },
          { key: "mimeType", label: "MIME" },
          {
            key: "size",
            label: "Size",
            render: (r) => `${Math.round(Number(r.size) / 1024)} KB`,
          },
          {
            key: "url",
            label: "Preview",
            render: (r) => (
              <a href={r.url as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                View
              </a>
            ),
          },
        ]}
      />
    </div>
  );
}
