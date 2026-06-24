import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { parseListParams } from "@/lib/admin/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { listCategories } from "@/lib/blog/queries";
import { uniqueCategorySlug } from "@/lib/blog/slug";
import { blogCategorySchema } from "@/validations/blog";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(req.url);
  const { search } = parseListParams(searchParams);

  const categories = await listCategories();
  const filtered = search
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  return apiSuccess({
    items: filtered.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      color: c.color,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      postCount: c._count.posts,
      createdAt: c.createdAt.toISOString(),
    })),
    pagination: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1 },
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const parsed = blogCategorySchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);

  const data = parsed.data;
  const slug = data.slug || (await uniqueCategorySlug(data.name));

  const category = await prisma.blogCategory.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      color: data.color,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  await logAudit({
    userId: auth.session!.user!.id,
    action: "create",
    entity: "blogCategory",
    entityId: category.id,
    newData: category,
  });
  return apiSuccess(category, 201);
}
