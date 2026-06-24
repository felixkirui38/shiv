import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getAiAdvisorPublicConfig } from "@/lib/ai-advisor/config";

export async function GET() {
  const config = await getAiAdvisorPublicConfig();
  return apiSuccess(config);
}
