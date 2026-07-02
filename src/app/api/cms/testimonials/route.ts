import { apiSuccess } from "@/lib/api-response";
import { getPublicTestimonials } from "@/lib/cms/public-content";

export async function GET() {
  const items = await getPublicTestimonials();
  return apiSuccess({ items });
}
