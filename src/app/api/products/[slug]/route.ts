import { getProductBySlug } from "@/lib/products/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return apiError("Product not found", 404);
    return apiSuccess(product);
  } catch {
    return apiError("Failed to fetch product", 500);
  }
}
