"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreatePartnerPanel } from "@/components/admin/create-partner-panel";

export default function AdminPartnersPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Partners"
        description="Insurance partners and underwriter logos."
        action={<CreatePartnerPanel onCreated={handleCreated} />}
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/partners"
        onRowClick={(row) => router.push(`/admin/partners/${row.id}`)}
        columns={[
          { key: "name", label: "Name" },
          { key: "website", label: "Website" },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
          { key: "sortOrder", label: "Order" },
        ]}
        bulkDelete
      />
    </div>
  );
}
