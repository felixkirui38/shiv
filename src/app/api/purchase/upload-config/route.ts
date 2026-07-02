import { apiSuccess } from "@/lib/api-response";
import { getApplicationUploadConfig } from "@/lib/purchase/documents";

export async function GET() {
  return apiSuccess(getApplicationUploadConfig());
}
