import { runPremiumCalculation } from "@/lib/premium-engine/calculate";
import {
  buildPremiumBreakdown,
  mapFormDataToFactors,
} from "@/lib/purchase/premium-breakdown";
import {
  getApplicationById,
  updateApplicationDraft,
} from "@/lib/purchase/service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await getApplicationById(id);
    if (!application) return apiError("Application not found", 404);

    const slug = application.product.slug;
    const factors = mapFormDataToFactors(application.formData);

    const ip = req.headers.get("x-forwarded-for");
    const userAgent = req.headers.get("user-agent");

    const result = await runPremiumCalculation(
      slug,
      { factors },
      { source: "PUBLIC", ipAddress: ip ?? undefined, userAgent: userAgent ?? undefined }
    );

    const premiumBreakdown = buildPremiumBreakdown(result);

    const updated = await updateApplicationDraft(id, {
      premiumBreakdown,
      totalPremium: premiumBreakdown.totalPremium,
      currentStep: Math.max(application.currentStep, 2),
      status: "SUBMITTED",
    });

    return apiSuccess({ breakdown: premiumBreakdown, calculation: result, application: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calculation failed";
    return apiError(message, 400);
  }
}
