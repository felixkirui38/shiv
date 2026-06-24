import { runPremiumCalculation } from "@/lib/premium-engine/calculate";
import {
  getQuoteWizardById,
  updateQuoteWizardDraft,
} from "@/lib/quote-wizard/service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await getQuoteWizardById(id);
    if (!quote) return apiError("Quote not found", 404);

    const slug = quote.wizardData.insurance?.productSlug ?? quote.product?.slug;
    if (!slug) return apiError("Product not selected", 400);

    const factors =
      quote.wizardData.coverage?.factors ??
      (await req.json().catch(() => ({}))).factors ??
      {};

    const ip = req.headers.get("x-forwarded-for");
    const userAgent = req.headers.get("user-agent");

    const result = await runPremiumCalculation(
      slug,
      { factors },
      { source: "PUBLIC", ipAddress: ip ?? undefined, userAgent: userAgent ?? undefined }
    );

    const wizardData = {
      ...quote.wizardData,
      premium: { result, calculatedAt: new Date().toISOString() },
    };

    const updated = await updateQuoteWizardDraft(id, {
      wizardData,
      estimatedPremium: result.totalPremium,
      calculatorData: result as object,
    });

    return apiSuccess({ result, quote: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calculation failed";
    return apiError(message, 400);
  }
}
