import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateLeadSchema } from "@/validations/admin-lead";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });
  if (!lead) return apiError("Lead not found", 404);

  return apiSuccess({
    ...lead,
    name: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return apiError("Lead not found", 404);

  const parsed = updateLeadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: parsed.data,
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "lead",
    entityId: id,
    oldData: existing,
    newData: lead,
  });

  return apiSuccess(lead);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return apiError("Lead not found", 404);

  await prisma.lead.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "lead",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
