import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { formFieldSchema } from "@/validations/form-admin";

type RouteCtx = { params: Promise<{ id: string; fieldId: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id, fieldId } = await ctx.params;
  const existing = await prisma.formField.findFirst({
    where: { id: fieldId, formId: id },
  });
  if (!existing) return apiError("Field not found", 404);

  const parsed = formFieldSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid field", 400);
  }

  if (parsed.data.key && parsed.data.key !== existing.key) {
    const keyTaken = await prisma.formField.findUnique({
      where: { formId_key: { formId: id, key: parsed.data.key } },
    });
    if (keyTaken) return apiError("Field key already in use", 409);
  }

  const { section, options, ...rest } = parsed.data;
  const currentValidation = (existing.validation as { section?: string } | null) ?? {};
  const field = await prisma.formField.update({
    where: { id: fieldId },
    data: {
      ...rest,
      ...(options !== undefined ? { options: options as object } : {}),
      ...(section !== undefined ? { validation: { ...currentValidation, section } } : {}),
    },
  });

  await prisma.formDefinition.update({
    where: { id },
    data: { version: { increment: 1 } },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "formField",
    entityId: fieldId,
    oldData: existing,
    newData: field,
  });

  return apiSuccess(field);
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id, fieldId } = await ctx.params;
  const existing = await prisma.formField.findFirst({
    where: { id: fieldId, formId: id },
  });
  if (!existing) return apiError("Field not found", 404);

  await prisma.formField.delete({ where: { id: fieldId } });
  await prisma.formDefinition.update({
    where: { id },
    data: { version: { increment: 1 } },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "formField",
    entityId: fieldId,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
