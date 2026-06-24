import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.INVOICES_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, status, export: doExport } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? { invoiceNumber: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { email: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);

  const rows = items.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customer: inv.user.email,
    status: inv.status,
    total: Number(inv.total),
    currency: inv.currency,
    dueDate: inv.dueDate?.toISOString().slice(0, 10) ?? "",
    createdAt: inv.createdAt.toISOString(),
  }));

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "invoiceNumber", label: "Invoice" },
        { key: "customer", label: "Customer" },
        { key: "status", label: "Status" },
        { key: "total", label: "Total" },
        { key: "currency", label: "Currency" },
      ]),
      `invoices-${Date.now()}.csv`
    );
  }

  return apiSuccess({ items: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
