import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { updateCareerApplicationSchema } from "@/validations/career-admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_VIEW);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const application = await prisma.careerApplication.findUnique({ where: { id } });
  if (!application) return apiError("Application not found", 404);

  let resume: { url: string; fileName: string } | null = null;
  if (application.resumeId) {
    const media = await prisma.media.findUnique({
      where: { id: application.resumeId },
      select: { url: true, originalName: true },
    });
    if (media) resume = { url: media.url, fileName: media.originalName };
  }

  return apiSuccess({
    ...application,
    createdAt: application.createdAt.toISOString(),
    resume,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.careerApplication.findUnique({ where: { id } });
  if (!existing) return apiError("Application not found", 404);

  const parsed = updateCareerApplicationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const application = await prisma.careerApplication.update({
    where: { id },
    data: parsed.data,
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "careerApplication",
    entityId: id,
    oldData: existing,
    newData: application,
  });

  return apiSuccess(application);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.LEADS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.careerApplication.findUnique({ where: { id } });
  if (!existing) return apiError("Application not found", 404);

  await prisma.careerApplication.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "careerApplication",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
