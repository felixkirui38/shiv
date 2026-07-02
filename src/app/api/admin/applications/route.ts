import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { updateAdminApplication } from "@/lib/admin/applications";
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
            { applicationNumber: { contains: search, mode: "insensitive" as const } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.insuranceApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        product: { select: { name: true } },
        user: { select: { email: true, firstName: true, lastName: true } },
        order: { select: { orderNumber: true, status: true } },
      },
    }),
    prisma.insuranceApplication.count({ where }),
  ]);

  const rows = items.map((a) => {
    const formData = (a.formData as Record<string, unknown>) ?? {};
    return {
      id: a.id,
      applicationNumber: a.applicationNumber,
      product: a.product.name,
      customer:
        String(formData.email ?? "") ||
        a.user?.email ||
        `${a.user?.firstName ?? ""} ${a.user?.lastName ?? ""}`.trim() ||
        "—",
      status: a.status,
      premium: Number(a.totalPremium),
      step: a.currentStep,
      orderNumber: a.order?.orderNumber ?? "—",
      createdAt: a.createdAt.toISOString(),
    };
  });

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "applicationNumber", label: "Application" },
        { key: "product", label: "Product" },
        { key: "customer", label: "Customer" },
        { key: "status", label: "Status" },
        { key: "premium", label: "Premium" },
      ]),
      `applications-${Date.now()}.csv`
    );
  }

  return apiSuccess({
    items: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.QUOTES_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = (await req.json()) as {
    id: string;
    action: "approve" | "reject" | "request_documents";
    reason?: string;
    notes?: string;
  };

  if (!body.id || !body.action) return apiError("id and action required", 400);

  const updated = await updateAdminApplication(body.id, body.action, {
    reason: body.reason,
    notes: body.notes,
  });

  return apiSuccess(updated);
}
