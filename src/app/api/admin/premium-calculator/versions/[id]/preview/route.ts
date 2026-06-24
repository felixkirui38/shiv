import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { runPremiumCalculation } from "@/lib/premium-engine/calculate";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { calculateInputSchema } from "@/validations/premium-formula";
import type { UserRole } from "@/generated/prisma/client";

export async function POST(
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
    const { id: versionId } = await params;
    const body = calculateInputSchema.parse(await req.json());

    const version = await prisma.premiumFormulaVersion.findUnique({
      where: { id: versionId },
      include: { config: { include: { product: true } } },
    });
    if (!version) return apiError("Version not found", 404);

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const result = await runPremiumCalculation(
      version.config.product.slug,
      { factors: body.factors },
      {
        source: "PREVIEW",
        userId: session.user.id,
        ipAddress: ip ?? undefined,
        userAgent: userAgent ?? undefined,
        versionId,
      }
    );

    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Preview failed";
    return apiError(message, 400);
  }
}
