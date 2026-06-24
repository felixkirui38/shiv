import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getCalculatorConfigByProductId } from "@/lib/premium-engine/queries";
import { ensureCalculatorConfig } from "@/lib/premium-engine/calculate";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  const { productId } = await params;
  let config = await getCalculatorConfigByProductId(productId);

  if (!config) {
    const product = await prisma.insuranceProduct.findUnique({
      where: { id: productId },
    });
    if (!product) return apiError("Product not found", 404);

    await ensureCalculatorConfig(
      product.id,
      product.slug,
      product.category,
      Number(product.basePremium)
    );
    config = await getCalculatorConfigByProductId(productId);
  }

  if (!config) return apiError("Failed to load calculator config", 500);
  return apiSuccess(config);
}
