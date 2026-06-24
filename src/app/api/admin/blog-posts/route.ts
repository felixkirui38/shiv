import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { parseListParams } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { listAdminPosts } from "@/lib/blog/queries";
import { uniquePostSlug } from "@/lib/blog/slug";
import { resolvePublishFields } from "@/lib/blog/publish";
import { blogPostSchema } from "@/validations/blog";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { search, page, limit, status } = parseListParams(searchParams);
  const categoryId = searchParams.get("categoryId") ?? undefined;

  if (searchParams.get("export") === "csv") {
    const result = await listAdminPosts({ search, status, categoryId, page: 1, limit: 10000 });
    const header = "Title,Slug,Category,Status,Views,Published\n";
    const rows = result.items
      .map((p) =>
        [
          `"${p.title.replace(/"/g, '""')}"`,
          p.slug,
          p.categoryName ?? "",
          p.status,
          p.viewCount,
          p.publishedAt ?? "",
        ].join(",")
      )
      .join("\n");
    return new Response(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="blog-posts.csv"`,
      },
    });
  }

  const result = await listAdminPosts({ search, status, categoryId, page, limit });
  return apiSuccess(result);
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);

  const data = parsed.data;
  const slug = data.slug || (await uniquePostSlug(data.title));
  const publish = resolvePublishFields(data.status, data.scheduledAt);

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      categoryId: data.categoryId ?? null,
      authorId: data.authorId ?? auth.session!.user!.id,
      featuredImageId: data.featuredImageId ?? null,
      tags: data.tags,
      status: data.status,
      isFeatured: data.isFeatured,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      ...publish,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "create",
    entity: "blogPost",
    entityId: post.id,
    newData: post,
  });
  return apiSuccess(post, 201);
}
