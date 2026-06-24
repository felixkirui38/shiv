import { apiSuccess } from "@/lib/api-response";
import { listPublishedPosts, listCategories } from "@/lib/blog/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const search = searchParams.get("search") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;

  const [posts, categories] = await Promise.all([
    listPublishedPosts({ page, limit, search, categorySlug, tag }),
    listCategories(),
  ]);

  return apiSuccess({
    ...posts,
    categories: categories
      .filter((c) => c.isActive)
      .map((c) => ({ slug: c.slug, name: c.name, color: c.color })),
  });
}
