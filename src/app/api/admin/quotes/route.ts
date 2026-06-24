import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.QUOTES_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, status, export: doExport } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { quoteNumber: { contains: search, mode: "insensitive" as const } },
            { customerEmail: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        product: { select: { name: true } },
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.quote.count({ where }),
  ]);

  const rows = items.map((q) => ({
    id: q.id,
    quoteNumber: q.quoteNumber,
    product: q.product.name,
    customer: q.customerEmail ?? q.user?.email ?? "—",
    status: q.status,
    premium: Number(q.estimatedPremium),
    step: q.currentStep,
    createdAt: q.createdAt.toISOString(),
  }));

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "quoteNumber", label: "Quote" },
        { key: "product", label: "Product" },
        { key: "customer", label: "Customer" },
        { key: "status", label: "Status" },
        { key: "premium", label: "Premium" },
      ]),
      `quotes-${Date.now()}.csv`
    );
  }

  return apiSuccess({ items: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
