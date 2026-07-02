import { apiSuccess } from "@/lib/api-response";
import { getPublicWebsiteSections } from "@/lib/cms/public-content";

export async function GET() {
  const data = await getPublicWebsiteSections();
  return apiSuccess(data);
}
