import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { getFormSubmissionDetail } from "@/lib/admin/form-submissions";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

type RouteCtx = { params: Promise<{ id: string; submissionId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id, submissionId } = await ctx.params;
  const submission = await getFormSubmissionDetail(id, submissionId);
  if (!submission) return apiError("Submission not found", 404);

  return apiSuccess(submission);
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id, submissionId } = await ctx.params;
  const existing = await prisma.formSubmission.findFirst({
    where: { id: submissionId, formId: id },
  });
  if (!existing) return apiError("Submission not found", 404);

  await prisma.formSubmission.delete({ where: { id: submissionId } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "formSubmission",
    entityId: submissionId,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.FORMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id, submissionId } = await ctx.params;
  const existing = await prisma.formSubmission.findFirst({
    where: { id: submissionId, formId: id },
  });
  if (!existing) return apiError("Submission not found", 404);

  const body = await req.json();
  const status = body.status as string | undefined;
  if (!status) return apiError("status is required", 400);

  await prisma.formSubmission.update({
    where: { id: submissionId },
    data: { status },
  });

  const submission = await getFormSubmissionDetail(id, submissionId);
  return apiSuccess(submission);
}
