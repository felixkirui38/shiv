import { auth } from "@/lib/auth";
import {
  getQuoteWizardById,
  updateQuoteWizardDraft,
} from "@/lib/quote-wizard/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { PremiumCalculationResult } from "@/lib/premium-engine/types";
import type { QuoteWizardData } from "@/types/quote-wizard";
import { wizardAutosaveSchema } from "@/validations/quote-wizard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await getQuoteWizardById(id);
  if (!quote) return apiError("Quote not found", 404);
  return apiSuccess(quote);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = wizardAutosaveSchema.parse(await req.json());

    const existing = await getQuoteWizardById(id);
    if (!existing) return apiError("Quote not found", 404);
    if (existing.status !== "DRAFT") return apiError("Quote is no longer editable", 400);

    const quote = await updateQuoteWizardDraft(id, {
      currentStep: body.currentStep,
      wizardData: body.wizardData as QuoteWizardData,
      customerEmail: body.wizardData.customer?.email,
      estimatedPremium:
        body.wizardData.premium?.result &&
        typeof body.wizardData.premium.result === "object" &&
        "totalPremium" in (body.wizardData.premium.result as object)
          ? Number((body.wizardData.premium.result as PremiumCalculationResult).totalPremium)
          : undefined,
      calculatorData: body.wizardData.premium?.result
        ? (body.wizardData.premium.result as object)
        : undefined,
    });

    return apiSuccess(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Autosave failed";
    return apiError(message, 400);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");
  await prisma.quote.update({
    where: { id },
    data: { status: "EXPIRED" },
  });
  return apiSuccess({ deleted: true });
}
