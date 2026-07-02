import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { formDefinitionSchema } from "@/validations/form-admin";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.formDefinition.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { submissions: true, fields: true } } },
  });

  return apiSuccess({
    items: items.map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      isActive: f.isActive,
      fields: f._count.fields,
      submissions: f._count.submissions,
      version: f.version,
      updatedAt: f.updatedAt.toISOString(),
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const parsed = formDefinitionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const existing = await prisma.formDefinition.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) return apiError("A form with this slug already exists", 409);

  const form = await prisma.formDefinition.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      productId: parsed.data.productId ?? undefined,
      isActive: parsed.data.isActive ?? true,
      settings: parsed.data.settings as object | undefined,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "create",
    entity: "formDefinition",
    entityId: form.id,
    newData: form,
  });

  return apiSuccess(form, 201);
}
