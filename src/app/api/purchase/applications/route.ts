import { prisma } from "@/lib/prisma";
import { createApplicationDraft } from "@/lib/purchase/service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { productSlug?: string; productId?: string };
    const product =
      body.productId
        ? await prisma.insuranceProduct.findUnique({ where: { id: body.productId } })
        : body.productSlug
          ? await prisma.insuranceProduct.findUnique({ where: { slug: body.productSlug } })
          : null;

    if (!product) return apiError("Product not found", 404);

    const sessionId = req.headers.get("x-session-id") ?? undefined;
    const application = await createApplicationDraft({
      productId: product.id,
      sessionId,
    });

    return apiSuccess(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create application";
    return apiError(message, 400);
  }
}
