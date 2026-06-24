import { getApplicationByToken } from "@/lib/purchase/service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const application = await getApplicationByToken(token);
  if (!application) return apiError("Application not found or expired", 404);
  return apiSuccess(application);
}
