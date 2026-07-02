import { headers } from "next/headers";
import { getPaymentProvider } from "@/lib/payments/gateway";
import { processWebhook } from "@/lib/payments/webhooks";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headersList = await headers();
  const headerMap: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headerMap[key.toLowerCase()] = value;
  });

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return apiError("Invalid payload", 400);
  }

  const adapter = getPaymentProvider("MPESA");
  if (adapter.verifyWebhook && !adapter.verifyWebhook(rawBody, headerMap)) {
    return apiError("Invalid webhook signature", 401);
  }

  try {
    await processWebhook("MPESA", body, headerMap, rawBody);
  } catch {
    return apiError("Webhook processing failed", 400);
  }

  return apiSuccess({ received: true });
}
