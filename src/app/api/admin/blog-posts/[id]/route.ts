import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { getAdminPost } from "@/lib/blog/queries";
import { uniquePostSlug } from "@/lib/blog/slug";
import { resolvePublishFields } from "@/lib/blog/publish";
import { blogPostSchema } from "@/validations/blog";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await ctx.params;
  const post = await getAdminPost(id);
  if (!post) return apiError("Post not found", 404);
  return apiSuccess(post);
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await ctx.params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return apiError("Post not found", 404);

  const body = await req.json();
  const parsed = blogPostSchema.partial().safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);

  const data = parsed.data;
  const status = data.status ?? existing.status;
  const publish = resolvePublishFields(
    status,
    data.scheduledAt ?? existing.scheduledAt?.toISOString(),
    existing.publishedAt
  );

  const slug =
    data.slug ??
    (data.title && data.title !== existing.title
      ? await uniquePostSlug(data.title, id)
      : existing.slug);

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      slug,
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.authorId !== undefined ? { authorId: data.authorId } : {}),
      ...(data.featuredImageId !== undefined ? { featuredImageId: data.featuredImageId } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      status,
      ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
      ...(data.metaTitle !== undefined ? { metaTitle: data.metaTitle } : {}),
      ...(data.metaDescription !== undefined ? { metaDescription: data.metaDescription } : {}),
      ...(data.metaKeywords !== undefined ? { metaKeywords: data.metaKeywords } : {}),
      ...publish,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "blogPost",
    entityId: post.id,
    oldData: existing,
    newData: post,
  });
  return apiSuccess(post);
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { id } = await ctx.params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return apiError("Post not found", 404);

  await prisma.blogPost.delete({ where: { id } });
  await logAudit({
    userId: auth.session!.user!.id,
    action: "delete",
    entity: "blogPost",
    entityId: id,
    oldData: existing,
  });
  return apiSuccess({ deleted: true });
}
