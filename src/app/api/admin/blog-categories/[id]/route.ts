import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { uniqueCategorySlug } from "@/lib/blog/slug";
import { blogCategorySchema } from "@/validations/blog";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await ctx.params;
  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) return apiError("Category not found", 404);

  const body = await req.json();
  const parsed = blogCategorySchema.partial().safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);

  const data = parsed.data;
  const slug =
    data.slug ??
    (data.name && data.name !== existing.name
      ? await uniqueCategorySlug(data.name, id)
      : existing.slug);

  const category = await prisma.blogCategory.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      slug,
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "blogCategory",
    entityId: category.id,
    oldData: existing,
    newData: category,
  });
  return apiSuccess(category);
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await ctx.params;
  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) return apiError("Category not found", 404);

  await prisma.blogCategory.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "blogCategory",
    entityId: id,
    oldData: existing,
  });
  return apiSuccess({ deleted: true });
}
