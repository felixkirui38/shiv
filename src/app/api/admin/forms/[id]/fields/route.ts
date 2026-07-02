import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { formFieldSchema } from "@/validations/form-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const form = await prisma.formDefinition.findUnique({ where: { id } });
  if (!form) return apiError("Form not found", 404);

  const parsed = formFieldSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid field", 400);
  }

  const existingKey = await prisma.formField.findUnique({
    where: { formId_key: { formId: id, key: parsed.data.key } },
  });
  if (existingKey) return apiError("A field with this key already exists", 409);

  const { section, options, ...rest } = parsed.data;
  const field = await prisma.formField.create({
    data: {
      formId: id,
      ...rest,
      isRequired: rest.isRequired ?? false,
      sortOrder: rest.sortOrder ?? 0,
      options: options as object | undefined,
      validation: section ? { section } : undefined,
    },
  });

  await prisma.formDefinition.update({
    where: { id },
    data: { version: { increment: 1 } },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "create",
    entity: "formField",
    entityId: field.id,
    newData: field,
  });

  return apiSuccess(field, 201);
}
