import { apiSuccess } from "@/lib/api-response";
import { getPublicPartners } from "@/lib/cms/public-content";

export async function GET() {
  const items = await getPublicPartners();
  return apiSuccess({ items });
}
