import { auth } from "@/lib/auth";
import { listPortalDocuments } from "@/lib/portal/queries";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const documents = await listPortalDocuments(session.user.id);
  return apiSuccess(documents);
}
