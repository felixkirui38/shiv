import { apiSuccess, apiError } from "@/lib/api-response";
import { getPostBySlug } from "@/lib/blog/queries";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const post = await getPostBySlug(slug, true);
  if (!post) return apiError("Post not found", 404);
  return apiSuccess(post);
}
