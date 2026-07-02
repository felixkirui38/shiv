import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { cmsPageSchema } from "@/validations/cms-page";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) return apiError("Page not found", 404);

  return apiSuccess({
    ...page,
    publishedAt: page.publishedAt?.toISOString() ?? null,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) return apiError("Page not found", 404);

  const parsed = cmsPageSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.cmsPage.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return apiError("Slug already in use", 409);
  }

  const isPublished = parsed.data.isPublished;
  const page = await prisma.cmsPage.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.blocks !== undefined ? { blocks: parsed.data.blocks as object } : {}),
      ...(isPublished === true && !existing.isPublished ? { publishedAt: new Date() } : {}),
      ...(isPublished === false ? { publishedAt: null } : {}),
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "cmsPage",
    entityId: id,
    oldData: existing,
    newData: page,
  });

  return apiSuccess(page);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await params;
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) return apiError("Page not found", 404);

  await prisma.cmsPage.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "cmsPage",
    entityId: id,
    oldData: existing,
  });

  return apiSuccess({ deleted: true });
}
