import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { listAllTemplates } from "@/lib/notifications";

export async function GET() {
  const auth = await requireAdmin(PERMISSIONS.NOTIFICATIONS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const templates = await listAllTemplates();
  return apiSuccess(
    templates.map((t) => ({
      id: t.id,
      event: t.event,
      channel: t.channel,
      name: t.name,
      subject: t.subject,
      body: t.body,
      variables: t.variables,
      isActive: t.isActive,
      updatedAt: t.updatedAt.toISOString(),
    }))
  );
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.NOTIFICATIONS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const { id, subject, body: templateBody, isActive } = body as {
    id: string;
    subject?: string;
    body?: string;
    isActive?: boolean;
  };

  if (!id) return apiError("Template id required", 400);

  const existing = await prisma.notificationTemplate.findUnique({ where: { id } });
  if (!existing) return apiError("Template not found", 404);

  const updated = await prisma.notificationTemplate.update({
    where: { id },
    data: {
      ...(subject !== undefined ? { subject } : {}),
      ...(templateBody !== undefined ? { body: templateBody } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "notificationTemplate",
    entityId: id,
    oldData: existing,
    newData: updated,
  });

  return apiSuccess(updated);
}
