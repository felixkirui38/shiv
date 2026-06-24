import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.POLICIES_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, status, export: doExport } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { policyNumber: { contains: search, mode: "insensitive" as const } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        product: { select: { name: true } },
      },
    }),
    prisma.policy.count({ where }),
  ]);

  const rows = items.map((p) => ({
    id: p.id,
    policyNumber: p.policyNumber,
    customer: `${p.user.firstName ?? ""} ${p.user.lastName ?? ""}`.trim() || p.user.email,
    product: p.product.name,
    status: p.status,
    premium: Number(p.premium),
    startDate: p.startDate?.toISOString().slice(0, 10) ?? "",
    endDate: p.endDate?.toISOString().slice(0, 10) ?? "",
    createdAt: p.createdAt.toISOString(),
  }));

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "policyNumber", label: "Policy" },
        { key: "customer", label: "Customer" },
        { key: "product", label: "Product" },
        { key: "status", label: "Status" },
        { key: "premium", label: "Premium" },
      ]),
      `policies-${Date.now()}.csv`
    );
  }

  return apiSuccess({ items: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
