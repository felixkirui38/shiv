import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { statisticSchema } from "@/validations/statistic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const item = await prisma.statistic.findUnique({ where: { id } });
  if (!item) return apiError("Statistic not found", 404);

  return apiSuccess(item);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.statistic.findUnique({ where: { id } });
  if (!existing) return apiError("Statistic not found", 404);

  const parsed = statisticSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const item = await prisma.statistic.update({
    where: { id },
    data: parsed.data,
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "statistic",
    entityId: item.id,
    oldData: existing,
    newData: item,
  });

  return apiSuccess(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.statistic.findUnique({ where: { id } });
  if (!existing) return apiError("Statistic not found", 404);

  await prisma.statistic.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "statistic",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
