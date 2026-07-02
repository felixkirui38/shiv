"use client";

import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FormSubmissionsListProps {
  formId: string;
  formName: string;
  formSlug: string;
}

export function FormSubmissionsList({ formId, formName, formSlug }: FormSubmissionsListProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Submissions — ${formName}`}
        description={`/${formSlug} · responses submitted via the public forms API`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/forms/${formId}`}>Edit form</Link>
            </Button>
            <Link href="/admin/forms">
              <Button variant="outline">All forms</Button>
            </Link>
          </div>
        }
      />
      <AdminDataTable
        apiPath={`/api/admin/forms/${formId}/submissions`}
        onRowClick={(row) => router.push(`/admin/forms/${formId}/submissions/${row.id}`)}
        columns={[
          {
            key: "createdAt",
            label: "Submitted",
            render: (r) => new Date(r.createdAt as string).toLocaleString(),
          },
          { key: "submittedBy", label: "Submitter" },
          { key: "email", label: "Email" },
          { key: "preview", label: "Preview" },
          { key: "status", label: "Status" },
        ]}
        exportFilename={`form-submissions-${formSlug}`}
      />
    </div>
  );
}
