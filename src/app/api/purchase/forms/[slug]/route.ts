import { getPurchaseFormByProductSlug } from "@/lib/purchase/forms";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const form = await getPurchaseFormByProductSlug(slug);
    if (!form) return apiError("Application form not configured for this product", 404);
    return apiSuccess(form);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load form";
    return apiError(message, 500);
  }
}
