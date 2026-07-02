import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { faqSchema } from "@/validations/faq";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FAQ_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) return apiError("FAQ not found", 404);

  return apiSuccess(faq);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FAQ_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) return apiError("FAQ not found", 404);

  const parsed = faqSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  const faq = await prisma.faq.update({
    where: { id },
    data: parsed.data,
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "faq",
    entityId: faq.id,
    oldData: existing,
    newData: faq,
  });

  return apiSuccess(faq);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.FAQ_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) return apiError("FAQ not found", 404);

  await prisma.faq.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "faq",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
