import { getQuoteWizardByToken } from "@/lib/quote-wizard/service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const quote = await getQuoteWizardByToken(token);
  if (!quote) return apiError("Draft not found or expired", 404);
  return apiSuccess(quote);
}
