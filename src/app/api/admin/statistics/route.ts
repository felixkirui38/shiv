import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { statisticSchema } from "@/validations/statistic";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.statistic.findMany({ orderBy: { sortOrder: "asc" } });
  return apiSuccess({
    items: items.map((s) => ({
      id: s.id,
      label: s.label,
      value: s.value,
      suffix: s.suffix ?? "",
      icon: s.icon ?? "",
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const parsed = statisticSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const item = await prisma.statistic.create({
    data: {
      ...parsed.data,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "create",
    entity: "statistic",
    entityId: item.id,
    newData: item,
  });

  return apiSuccess(item, 201);
}
