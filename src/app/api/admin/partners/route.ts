import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.PARTNERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.partner.findMany({ orderBy: { sortOrder: "asc" } });
  return apiSuccess({
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      website: p.website,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.PARTNERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const item = await prisma.partner.create({
    data: {
      name: body.name,
      website: body.website,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  await logAudit({ userId: auth.session!.user!.id, action: "create", entity: "partner", entityId: item.id, newData: item });
  return apiSuccess(item, 201);
}
