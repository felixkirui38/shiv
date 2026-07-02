import { AdminFormEditClient } from "@/components/admin/admin-form-edit-client";

export default async function AdminFormEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminFormEditClient formId={id} />;
}
