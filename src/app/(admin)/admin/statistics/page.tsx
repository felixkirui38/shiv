"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateStatisticPanel } from "@/components/admin/create-statistic-panel";

export default function AdminStatisticsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Statistics"
        description="Homepage counter stats shown in the company statistics section."
        action={<CreateStatisticPanel onCreated={handleCreated} />}
      />
      <AdminDataTable
        key={refreshKey}
        apiPath="/api/admin/statistics"
        onRowClick={(row) => router.push(`/admin/statistics/${row.id}`)}
        columns={[
          { key: "label", label: "Label" },
          { key: "value", label: "Value" },
          { key: "suffix", label: "Suffix" },
          { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
          { key: "sortOrder", label: "Order" },
        ]}
        bulkDelete
      />
    </div>
  );
}
