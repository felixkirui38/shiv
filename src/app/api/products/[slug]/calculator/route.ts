import { getPublicCalculatorConfig } from "@/lib/premium-engine/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const config = await getPublicCalculatorConfig(slug);
    if (!config) return apiError("Calculator not configured for this product", 404);
    return apiSuccess(config);
  } catch {
    return apiError("Failed to load calculator", 500);
  }
}
