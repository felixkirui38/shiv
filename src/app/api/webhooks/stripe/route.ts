import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import { processWebhook } from "@/lib/payments/webhooks";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return apiError("Missing webhook signature", 400);
  }

  let event;
  try {
    event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return apiError("Invalid webhook signature", 400);
  }

  try {
    await processWebhook(
      "STRIPE",
      event,
      { "stripe-signature": signature },
      body
    );
  } catch {
    return apiError("Webhook processing failed", 400);
  }

  return apiSuccess({ received: true });
}
