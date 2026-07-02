import { apiSuccess } from "@/lib/api-response";
import { getPublicFaqs } from "@/lib/cms/public-content";

export async function GET() {
  const items = await getPublicFaqs();
  return apiSuccess({ items });
}
