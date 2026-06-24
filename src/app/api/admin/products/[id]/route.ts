import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/lib/products/mutations";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";
import type { UpdateProductInput } from "@/validations/product";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return apiError("Product not found", 404);
  return apiSuccess(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateProductInput;
    const product = await updateProduct(id, body);
    return apiSuccess(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return apiError(message, 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  try {
    const { id } = await params;
    await deleteProduct(id);
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Failed to delete product", 500);
  }
}
