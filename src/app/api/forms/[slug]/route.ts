import { apiSuccess, apiError } from "@/lib/api-response";
import { getPublicFormBySlug } from "@/lib/forms/public";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const form = await getPublicFormBySlug(slug);
  if (!form) return apiError("Form not found", 404);
  return apiSuccess(form);
}
