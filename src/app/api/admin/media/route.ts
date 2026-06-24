import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.MEDIA_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = search
    ? { originalName: { contains: search, mode: "insensitive" as const } }
    : {};

  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.media.count({ where }),
  ]);

  return apiSuccess({
    items: items.map((m) => ({
      id: m.id,
      name: m.originalName,
      type: m.type,
      mimeType: m.mimeType,
      size: m.size,
      url: m.url,
      createdAt: m.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
