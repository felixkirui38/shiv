import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createDraftVersion } from "@/lib/premium-engine/calculate";
import { apiSuccess, apiError } from "@/lib/api-response";
import { createDraftSchema } from "@/validations/premium-formula";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "products:manage")) {
    return apiError("Forbidden", 403);
  }

  try {
    const { productId } = await params;
    const body = createDraftSchema.parse(await req.json());

    const config = await prisma.premiumCalculatorConfig.findUnique({
      where: { productId },
    });
    if (!config) return apiError("Calculator config not found", 404);

    const draft = await createDraftVersion(
      config.id,
      session.user.id,
      body.changelog
    );

    return apiSuccess(draft, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create draft";
    return apiError(message, 400);
  }
}
