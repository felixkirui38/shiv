import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getAllProducts } from "@/lib/products/queries";
import { createProduct } from "@/lib/products/mutations";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";
import type { CreateProductInput } from "@/validations/product";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  try {
    const products = await getAllProducts();
    return apiSuccess(products);
  } catch {
    return apiError("Failed to fetch products", 500);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  try {
    const body = (await req.json()) as CreateProductInput;
    const product = await createProduct(body);
    return apiSuccess(product, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return apiError(message, 400);
  }
}
