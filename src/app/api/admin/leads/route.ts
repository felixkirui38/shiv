import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { parseListParams } from "@/lib/admin/queries";
import { toCsv, csvResponse } from "@/lib/admin/export";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { page, limit, search, status, export: doExport } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.lead.count({ where }),
  ]);

  const rows = items.map((l) => ({
    id: l.id,
    name: `${l.firstName} ${l.lastName ?? ""}`.trim(),
    email: l.email,
    phone: l.phone,
    status: l.status,
    source: l.source,
    productType: l.productType,
    createdAt: l.createdAt.toISOString(),
  }));

  if (doExport) {
    return csvResponse(
      toCsv(rows, [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" },
        { key: "source", label: "Source" },
      ]),
      `leads-${Date.now()}.csv`
    );
  }

  return apiSuccess({ items: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const lead = await prisma.lead.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      source: body.source,
      productType: body.productType,
      status: body.status ?? "NEW",
      notes: body.notes,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "create",
    entity: "lead",
    entityId: lead.id,
    newData: lead,
  });

  return apiSuccess(lead, 201);
}
