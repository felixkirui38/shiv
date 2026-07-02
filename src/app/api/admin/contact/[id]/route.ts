import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const submission = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!submission) return apiError("Message not found", 404);

  if (!submission.isRead) {
    await prisma.contactSubmission.update({
      where: { id },
      data: { isRead: true },
    });
  }

  return apiSuccess({
    ...submission,
    createdAt: submission.createdAt.toISOString(),
    repliedAt: submission.repliedAt?.toISOString() ?? null,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!existing) return apiError("Message not found", 404);

  const body = await req.json();
  const submission = await prisma.contactSubmission.update({
    where: { id },
    data: {
      ...(body.isRead !== undefined ? { isRead: Boolean(body.isRead) } : {}),
      ...(body.repliedAt ? { repliedAt: new Date(body.repliedAt) } : {}),
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "contactSubmission",
    entityId: id,
    oldData: existing,
    newData: submission,
  });

  return apiSuccess(submission);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!existing) return apiError("Message not found", 404);

  await prisma.contactSubmission.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "contactSubmission",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
