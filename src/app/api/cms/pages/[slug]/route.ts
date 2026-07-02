import { apiSuccess, apiError } from "@/lib/api-response";
import { getPublicCmsPage } from "@/lib/cms/public-content";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const page = await getPublicCmsPage(slug);
  if (!page) return apiError("Page not found", 404);
  return apiSuccess(page);
}
