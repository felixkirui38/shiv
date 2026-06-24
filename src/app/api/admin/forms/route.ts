import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

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
