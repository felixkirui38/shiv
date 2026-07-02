import { notFound } from "next/navigation";
import { getAdminFormById } from "@/lib/admin/forms";
import { FormSubmissionsList } from "@/components/admin/form-submissions-list";

export default async function AdminFormSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await getAdminFormById(id);
  if (!form) notFound();

  return (
    <FormSubmissionsList formId={id} formName={form.name} formSlug={form.slug} />
  );
}
