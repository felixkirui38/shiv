import { auth } from "@/lib/auth";
import { getClaimById } from "@/lib/claims/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { id } = await params;
  const claim = await getClaimById(id, { userId: session.user.id });
  if (!claim) return apiError("Claim not found", 404);

  return apiSuccess(claim);
}
