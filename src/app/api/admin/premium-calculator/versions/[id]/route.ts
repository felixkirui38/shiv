import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { updateFormulaVersion } from "@/lib/premium-engine/calculate";
import { apiSuccess, apiError } from "@/lib/api-response";
import { updateFormulaVersionSchema } from "@/validations/premium-formula";
import type { UserRole } from "@/generated/prisma/client";

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
    const body = updateFormulaVersionSchema.parse(await req.json());

    const updated = await updateFormulaVersion(
      id,
      {
        name: body.name,
        changelog: body.changelog,
        basePremium: body.basePremium,
        formula: body.formula as object | undefined,
        fields: body.fields as object | undefined,
      },
      session.user.id
    );

    return apiSuccess(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update version";
    return apiError(message, 400);
  }
}
