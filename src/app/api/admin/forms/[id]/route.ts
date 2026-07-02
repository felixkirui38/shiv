import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { getAdminFormById } from "@/lib/admin/forms";
import { formDefinitionSchema } from "@/validations/form-admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const form = await getAdminFormById(id);
  if (!form) return apiError("Form not found", 404);

  return apiSuccess(form);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.formDefinition.findUnique({ where: { id } });
  if (!existing) return apiError("Form not found", 404);

  const parsed = formDefinitionSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.formDefinition.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (slugTaken) return apiError("Slug already in use", 409);
  }

  const form = await prisma.formDefinition.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      ...(parsed.data.productId !== undefined ? { productId: parsed.data.productId } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      ...(parsed.data.settings !== undefined ? { settings: parsed.data.settings as object } : {}),
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "formDefinition",
    entityId: id,
    oldData: existing,
    newData: form,
  });

  const updated = await getAdminFormById(id);
  return apiSuccess(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.formDefinition.findUnique({ where: { id } });
  if (!existing) return apiError("Form not found", 404);

  await prisma.formDefinition.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "formDefinition",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
