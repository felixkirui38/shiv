import { apiSuccess } from "@/lib/api-response";
import { getPublicStatistics } from "@/lib/cms/public-content";

export async function GET() {
  const items = await getPublicStatistics();
  return apiSuccess({ items });
}
