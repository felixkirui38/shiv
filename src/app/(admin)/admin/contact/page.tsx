"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminContactPage() {
  const router = useRouter();

  return (
    <div>
      <AdminPageHeader title="Contact Inbox" description="Messages from the public contact form." />
      <AdminDataTable
        apiPath="/api/admin/contact"
        onRowClick={(row) => router.push(`/admin/contact/${row.id}`)}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "subject", label: "Subject" },
          { key: "message", label: "Message" },
          { key: "isRead", label: "Read", render: (r) => (r.isRead ? "Yes" : "New") },
          { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
