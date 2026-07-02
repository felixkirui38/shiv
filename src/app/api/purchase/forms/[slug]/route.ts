import { getPurchaseFormByProductSlug } from "@/lib/purchase/forms";
import { apiSuccess, apiError } from "@/lib/api-response";
import { isDbConnectionError, sanitizeApiErrorMessage } from "@/lib/db-retry";

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
    console.error("[purchase/forms]", error);
    if (isDbConnectionError(error)) {
      return apiError(
        "Application form is temporarily unavailable. Please try again in a moment.",
        503
      );
    }
    const message =
      error instanceof Error
        ? sanitizeApiErrorMessage(error.message, "Failed to load application form.")
        : "Failed to load application form.";
    return apiError(message, 500);
  }
}
