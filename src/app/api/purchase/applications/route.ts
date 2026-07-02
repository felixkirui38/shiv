import { createApplicationDraft } from "@/lib/purchase/service";
import { getProductBySlug } from "@/lib/products/queries";
import { apiSuccess, apiError } from "@/lib/api-response";
import { isDbConnectionError, sanitizeApiErrorMessage } from "@/lib/db-retry";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { productSlug?: string; productId?: string };

    const product = body.productSlug
      ? await getProductBySlug(body.productSlug)
      : null;

    if (!product) return apiError("Product not found", 404);

    if (product.id.startsWith("fallback-")) {
      return apiError(
        "Applications are temporarily unavailable. Please try again once the database is running.",
        503
      );
    }

    const sessionId = req.headers.get("x-session-id") ?? undefined;
    const application = await createApplicationDraft({
      productId: product.id,
      sessionId,
    });

    return apiSuccess(application);
  } catch (error) {
    console.error("[purchase/applications]", error);
    if (isDbConnectionError(error)) {
      return apiError(
        "Applications are temporarily unavailable. Please try again in a moment.",
        503
      );
    }
    const message =
      error instanceof Error
        ? sanitizeApiErrorMessage(error.message, "Failed to create application.")
        : "Failed to create application.";
    return apiError(message, 400);
  }
}
