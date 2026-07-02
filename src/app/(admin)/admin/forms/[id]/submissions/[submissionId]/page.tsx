import { FormSubmissionDetailClient } from "@/components/admin/form-submission-detail";

export default async function AdminFormSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = await params;
  return <FormSubmissionDetailClient formId={id} submissionId={submissionId} />;
}
