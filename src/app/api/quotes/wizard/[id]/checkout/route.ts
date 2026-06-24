import { prisma } from "@/lib/prisma";
import { createPaymentCheckout, createInstallmentPlan } from "@/lib/payments/checkout";
import {
  findOrCreateCustomerUser,
  getQuoteWizardById,
} from "@/lib/quote-wizard/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { PaymentPlanType, PaymentProvider } from "@/generated/prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as {
      provider?: PaymentProvider;
      planType?: PaymentPlanType;
      installmentCount?: number;
    };

    const quote = await getQuoteWizardById(id);
    if (!quote) return apiError("Quote not found", 404);

    const customer = quote.wizardData.customer;
    if (!customer) return apiError("Customer details required", 400);

    const premium =
      quote.wizardData.premium?.result?.totalPremium ?? quote.estimatedPremium;
    if (!premium || premium <= 0) return apiError("Premium not calculated", 400);

    const user = await findOrCreateCustomerUser({
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
    });

    await prisma.quote.update({
      where: { id },
      data: { userId: user.id },
    });

    const provider = body.provider ?? "STRIPE";
    const planType = body.planType ?? "ANNUAL";
    let installmentPlanId: string | undefined;
    let installmentNumber: number | undefined;
    let installmentTotal: number | undefined;
    let amount = premium;

    if (planType === "INSTALLMENT" && body.installmentCount) {
      const plan = await createInstallmentPlan({
        userId: user.id,
        quoteId: id,
        totalAmount: premium,
        installmentCount: body.installmentCount,
      });
      installmentPlanId = plan.id;
      installmentNumber = 1;
      installmentTotal = body.installmentCount;
      amount = Math.ceil(premium / body.installmentCount);
    }

    const result = await createPaymentCheckout({
      userId: user.id,
      quoteId: id,
      amount,
      currency: "KES",
      provider,
      planType,
      description: `${quote.product?.name ?? "Insurance"} — Quote ${quote.quoteNumber}`,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      installmentPlanId,
      installmentNumber,
      installmentTotal,
      successUrl: `${APP_URL}/quote/success?quote=${id}`,
      cancelUrl: `${APP_URL}/quote/resume/${quote.resumeToken}?step=8`,
    });

    return apiSuccess({
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return apiError(message, 400);
  }
}
