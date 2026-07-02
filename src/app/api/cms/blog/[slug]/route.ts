import { apiSuccess, apiError } from "@/lib/api-response";
import { getPublicBlogPost } from "@/lib/cms/public-content";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const post = await getPublicBlogPost(slug);
  if (!post) return apiError("Post not found", 404);
  return apiSuccess(post);
}
