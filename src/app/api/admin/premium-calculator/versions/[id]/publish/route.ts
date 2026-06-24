import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { publishFormulaVersion } from "@/lib/premium-engine/calculate";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { UserRole } from "@/generated/prisma/client";

export async function POST(
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
    await publishFormulaVersion(id, session.user.id);
    return apiSuccess({ published: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish";
    return apiError(message, 400);
  }
}
