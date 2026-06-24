import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.PAYMENTS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, status, export: doExport } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            { insuranceName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { email: true } },
        application: { select: { applicationNumber: true } },
        policy: { select: { policyNumber: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const rows = items.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    insuranceName: o.insuranceName,
    customer: o.user?.email ?? "—",
    application: o.application.applicationNumber,
    policy: o.policy?.policyNumber ?? "—",
    status: o.status,
    total: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
  }));

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "orderNumber", label: "Order" },
        { key: "insuranceName", label: "Product" },
        { key: "customer", label: "Customer" },
        { key: "status", label: "Status" },
        { key: "total", label: "Total" },
      ]),
      `orders-${Date.now()}.csv`
    );
  }

  return apiSuccess({
    items: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
