"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaUploadPanel } from "@/components/admin/media-upload-panel";
import { Button } from "@/components/ui/button";

export default function AdminMediaPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploaded = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media Library"
        description="Cloudinary-backed media assets for CMS content."
      />
      <MediaUploadPanel onUploaded={handleUploaded} />
      <AdminDataTable
        key={refreshKey}
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
              <a
                href={r.url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View
              </a>
            ),
          },
          {
            key: "id",
            label: "Actions",
            render: (r) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm(`Delete ${r.name}?`)) return;
                  const res = await fetch(`/api/admin/media/${r.id}`, { method: "DELETE" });
                  const data = await res.json();
                  if (data.success) handleUploaded();
                  else alert(data.error ?? "Delete failed");
                }}
              >
                Delete
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
