import { auth } from "@/lib/auth";
import { getActiveProducts } from "@/lib/products/queries";
import { createQuoteWizardDraft } from "@/lib/quote-wizard/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import { z } from "zod";

const createSchema = z.object({
  productId: z.string().optional(),
  productSlug: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = createSchema.parse(await req.json());

    let productId = body.productId;
    if (!productId && body.productSlug) {
      const products = await getActiveProducts();
      const match = products.find((p) => p.slug === body.productSlug);
      if (!match) return apiError("Product not found", 404);
      productId = match.id;
    }

    if (!productId) return apiError("productId or productSlug required", 400);

    const quote = await createQuoteWizardDraft({
      productId,
      sessionId: body.sessionId,
      userId: session?.user?.id,
    });

    return apiSuccess(quote, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create quote";
    return apiError(message, 400);
  }
}
