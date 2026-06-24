import { prisma } from "@/lib/prisma";
import { createPaymentCheckout } from "@/lib/payments/checkout";
import {
  createOrderFromApplication,
  findOrCreateCustomerUser,
  getApplicationById,
} from "@/lib/purchase/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import type { PaymentProvider } from "@/generated/prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { provider?: PaymentProvider };

    const application = await getApplicationById(id);
    if (!application) return apiError("Application not found", 404);

    const formData = application.formData;
    const email = String(formData.email ?? formData.contactEmail ?? "");
    const phone = String(formData.phone ?? formData.contactPhone ?? "");
    const fullName = String(formData.fullName ?? formData.businessName ?? "Customer");
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Applicant";

    if (!email) return apiError("Email is required before checkout", 400);

    const premium = application.premiumBreakdown?.totalPremium ?? application.totalPremium;
    if (!premium || premium <= 0) return apiError("Premium not calculated", 400);

    const user = await findOrCreateCustomerUser({ email, firstName, lastName, phone });

    await prisma.insuranceApplication.update({
      where: { id },
      data: { userId: user.id },
    });

    const order = await createOrderFromApplication(id);
    const provider = body.provider ?? "STRIPE";

    const result = await createPaymentCheckout({
      userId: user.id,
      applicationId: id,
      orderId: order.id,
      amount: Number(order.totalAmount),
      currency: "KES",
      provider,
      planType: "ONE_TIME",
      type: "ONE_TIME",
      description: `${application.product.name} — Order ${order.orderNumber}`,
      customerEmail: email,
      customerPhone: phone || undefined,
      successUrl: `${APP_URL}/purchase/success?order=${order.id}`,
      cancelUrl: `${APP_URL}/products/${application.product.slug}/buy?resume=${application.resumeToken}&step=4`,
    });

    return apiSuccess({
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return apiError(message, 400);
  }
}
