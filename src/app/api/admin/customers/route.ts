import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.CUSTOMERS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, export: doExport } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = {
    role: "CUSTOMER" as const,
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: { select: { policies: true, claims: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const rows = items.map((u) => ({
    id: u.id,
    email: u.email,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
    phone: u.phone,
    status: u.status,
    policies: u._count.policies,
    claims: u._count.claims,
    createdAt: u.createdAt.toISOString(),
  }));

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "email", label: "Email" },
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" },
        { key: "policies", label: "Policies" },
        { key: "claims", label: "Claims" },
      ]),
      `customers-${Date.now()}.csv`
    );
  }

  return apiSuccess({ items: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
