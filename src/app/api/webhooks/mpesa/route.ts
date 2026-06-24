import { processWebhook } from "@/lib/payments/webhooks";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  try {
    await processWebhook("MPESA", body, {}, "");
  } catch {
    return apiError("Webhook processing failed", 400);
  }

  return apiSuccess({ received: true });
}
