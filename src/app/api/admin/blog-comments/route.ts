import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { parseListParams } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { commentModerationSchema } from "@/validations/blog";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { search, page, limit, status } = parseListParams(searchParams);
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "SPAM" } : {}),
    ...(search
      ? {
          OR: [
            { authorName: { contains: search, mode: "insensitive" as const } },
            { authorEmail: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
            { post: { title: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { post: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.blogComment.count({ where }),
  ]);

  return apiSuccess({
    items: items.map((c) => ({
      id: c.id,
      authorName: c.authorName,
      authorEmail: c.authorEmail,
      content: c.content.slice(0, 120) + (c.content.length > 120 ? "…" : ""),
      status: c.status,
      postTitle: c.post.title,
      postSlug: c.post.slug,
      createdAt: c.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const { id, status } = body as { id?: string; status?: string };
  if (!id) return apiError("Comment id required", 400);

  const parsed = commentModerationSchema.safeParse({ status });
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid status", 400);

  const existing = await prisma.blogComment.findUnique({ where: { id } });
  if (!existing) return apiError("Comment not found", 404);

  const comment = await prisma.blogComment.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "moderate",
    entity: "blogComment",
    entityId: id,
    oldData: existing,
    newData: comment,
  });
  return apiSuccess(comment);
}
