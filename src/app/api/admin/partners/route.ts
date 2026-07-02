import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { partnerSchema } from "@/validations/partner";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.PARTNERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const items = await prisma.partner.findMany({
    orderBy: { sortOrder: "asc" },
    include: { logo: { select: { url: true } } },
  });
  return apiSuccess({
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      website: p.website ?? "",
      logoUrl: p.logo?.url ?? null,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    })),
    pagination: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.PARTNERS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const parsed = partnerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const { website, logoId, ...rest } = parsed.data;
  const item = await prisma.partner.create({
    data: {
      ...rest,
      website: website || null,
      logoId: logoId || null,
      isActive: rest.isActive ?? true,
      sortOrder: rest.sortOrder ?? 0,
    },
  });

  await logAudit({ userId: auth.session!.user!.id, action: "create", entity: "partner", entityId: item.id, newData: item });
  return apiSuccess(item, 201);
}
