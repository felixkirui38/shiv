import { getActiveProducts } from "@/lib/products/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return apiSuccess(products);
  } catch {
    return apiError("Failed to fetch products", 500);
  }
}
