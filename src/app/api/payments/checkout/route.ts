import { auth } from "@/lib/auth";
import { createPaymentCheckout, createInstallmentPlan } from "@/lib/payments/checkout";
import { getAvailableProviders } from "@/lib/payments/gateway";
import { findOrCreateCustomerUser } from "@/lib/quote-wizard/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkoutSchema } from "@/validations/payment";
import type { PaymentProvider } from "@/generated/prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  return apiSuccess({
    providers: getAvailableProviders(),
    plans: ["ONE_TIME", "SUBSCRIPTION", "INSTALLMENT", "ANNUAL"],
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = checkoutSchema.parse(await req.json());

    const user =
      session?.user?.id
        ? { id: session.user.id }
        : await findOrCreateCustomerUser({
            email: body.customerEmail,
            firstName: "Customer",
            lastName: "",
            phone: body.customerPhone,
          });

    let installmentPlanId: string | undefined;
    let installmentNumber: number | undefined;
    let installmentTotal: number | undefined;
    let amount = body.amount;

    if (body.planType === "INSTALLMENT" && body.installmentCount) {
      const plan = await createInstallmentPlan({
        userId: user.id,
        policyId: body.policyId,
        quoteId: body.quoteId,
        totalAmount: body.amount,
        installmentCount: body.installmentCount,
      });
      installmentPlanId = plan.id;
      installmentNumber = 1;
      installmentTotal = body.installmentCount;
      amount = Math.ceil(body.amount / body.installmentCount);
    }

    const result = await createPaymentCheckout({
      userId: user.id,
      amount,
      currency: body.currency,
      provider: body.provider as PaymentProvider,
      planType: body.planType,
      description: body.description,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      quoteId: body.quoteId,
      policyId: body.policyId,
      invoiceId: body.invoiceId,
      installmentPlanId,
      installmentNumber,
      installmentTotal,
      successUrl: body.successUrl ?? `${APP_URL}/purchase/success`,
      cancelUrl: body.cancelUrl ?? `${APP_URL}/products`,
    });

    return apiSuccess(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return apiError(message, 400);
  }
}
