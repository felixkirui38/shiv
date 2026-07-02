import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { partnerSchema } from "@/validations/partner";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.PARTNERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const item = await prisma.partner.findUnique({
    where: { id },
    include: { logo: { select: { id: true, url: true, originalName: true } } },
  });
  if (!item) return apiError("Partner not found", 404);

  return apiSuccess({
    ...item,
    logoUrl: item.logo?.url ?? null,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.PARTNERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) return apiError("Partner not found", 404);

  const parsed = partnerSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const { website, logoId, ...rest } = parsed.data;
  const item = await prisma.partner.update({
    where: { id },
    data: {
      ...rest,
      ...(website !== undefined ? { website: website || null } : {}),
      ...(logoId !== undefined ? { logoId: logoId || null } : {}),
    },
    include: { logo: { select: { id: true, url: true } } },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "partner",
    entityId: item.id,
    oldData: existing,
    newData: item,
  });

  return apiSuccess({ ...item, logoUrl: item.logo?.url ?? null });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.PARTNERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) return apiError("Partner not found", 404);

  await prisma.partner.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "partner",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
