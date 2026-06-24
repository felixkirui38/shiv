import { headers } from "next/headers";
import { processWebhook } from "@/lib/payments/webhooks";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const headerMap: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headerMap[key.toLowerCase()] = value;
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return apiError("Invalid payload", 400);
  }

  try {
    await processWebhook("FLUTTERWAVE", parsed, headerMap, body);
  } catch {
    return apiError("Webhook processing failed", 400);
  }

  return apiSuccess({ received: true });
}
