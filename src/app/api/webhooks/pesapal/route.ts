import { headers } from "next/headers";
import { getPaymentProvider } from "@/lib/payments/gateway";
import { verifyPesapalTransaction } from "@/lib/payments/pesapal-verify";
import { processWebhook } from "@/lib/payments/webhooks";
import { apiSuccess, apiError } from "@/lib/api-response";

function headerMapFromHeaders(headersList: Headers) {
  const headerMap: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headerMap[key.toLowerCase()] = value;
  });
  return headerMap;
}

async function handlePesapalWebhook(body: Record<string, string>, rawBody: string) {
  const headersList = await headers();
  const headerMap = headerMapFromHeaders(headersList);
  const adapter = getPaymentProvider("PESAPAL");

  if (adapter.verifyWebhook && !adapter.verifyWebhook(rawBody, headerMap)) {
    return apiError("Invalid webhook signature", 401);
  }

  const trackingId = body.OrderTrackingId;
  if (trackingId && process.env.PESAPAL_CONSUMER_KEY) {
    const verified = await verifyPesapalTransaction(trackingId);
    if (!verified && body.OrderNotificationType !== "IPNCHANGE") {
      return apiError("Transaction verification failed", 400);
    }
  }

  try {
    await processWebhook("PESAPAL", body, headerMap, rawBody);
    return apiSuccess({ received: true });
  } catch {
    return apiError("Webhook processing failed", 400);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const body = Object.fromEntries(searchParams.entries());
  const rawBody = searchParams.toString();
  return handlePesapalWebhook(body, rawBody);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  let body: Record<string, string>;
  try {
    body = JSON.parse(rawBody) as Record<string, string>;
  } catch {
    return apiError("Invalid payload", 400);
  }
  return handlePesapalWebhook(body, rawBody);
}
