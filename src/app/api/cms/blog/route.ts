import { apiSuccess } from "@/lib/api-response";
import { getPublicBlogPosts } from "@/lib/cms/public-content";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const search = searchParams.get("search") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;

  const posts = await getPublicBlogPosts({ page, limit, search, categorySlug, tag });
  return apiSuccess(posts);
}
