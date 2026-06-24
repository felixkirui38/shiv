import { auth } from "@/lib/auth";
import { createPaymentCheckout } from "@/lib/payments/checkout";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { PaymentProvider } from "@/generated/prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ policyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  try {
    const { policyId } = await params;
    const body = (await req.json()) as {
      provider?: PaymentProvider;
      planType?: "ANNUAL" | "ONE_TIME" | "INSTALLMENT";
    };

    const policy = await prisma.policy.findFirst({
      where: { id: policyId, userId: session.user.id },
      include: { product: true, user: true },
    });
    if (!policy) return apiError("Policy not found", 404);

    const result = await createPaymentCheckout({
      userId: session.user.id,
      policyId: policy.id,
      amount: Number(policy.premium),
      currency: "KES",
      provider: body.provider ?? "STRIPE",
      planType: body.planType ?? "ANNUAL",
      type: "RENEWAL",
      description: `Renewal — ${policy.product.name}`,
      customerEmail: policy.user.email,
      customerPhone: policy.user.phone ?? undefined,
      successUrl: `${APP_URL}/portal/renewals?renewed=1`,
      cancelUrl: `${APP_URL}/portal/renewals`,
    });

    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Renewal failed";
    return apiError(message, 400);
  }
}
