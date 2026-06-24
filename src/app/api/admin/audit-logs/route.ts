import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.AUDIT_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, export: doExport } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { action: { contains: search, mode: "insensitive" as const } },
          { entity: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const rows = items.map((l) => ({
    id: l.id,
    action: l.action,
    entity: l.entity,
    entityId: l.entityId,
    user: l.user?.email ?? "System",
    createdAt: l.createdAt.toISOString(),
  }));

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "action", label: "Action" },
        { key: "entity", label: "Entity" },
        { key: "entityId", label: "Entity ID" },
        { key: "user", label: "User" },
        { key: "createdAt", label: "Date" },
      ]),
      `audit-logs-${Date.now()}.csv`
    );
  }

  return apiSuccess({ items: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
