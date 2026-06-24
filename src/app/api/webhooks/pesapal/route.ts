import { processWebhook } from "@/lib/payments/webhooks";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const body = Object.fromEntries(searchParams.entries());

  try {
    await processWebhook("PESAPAL", body, {}, "");
    return apiSuccess({ received: true });
  } catch {
    return apiError("Webhook processing failed", 400);
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  try {
    await processWebhook("PESAPAL", body, {}, "");
    return apiSuccess({ received: true });
  } catch {
    return apiError("Webhook processing failed", 400);
  }
}
