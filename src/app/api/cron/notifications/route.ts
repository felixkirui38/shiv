import { apiSuccess, apiError } from "@/lib/api-response";
import { processNotificationQueue, processRenewalReminders } from "@/lib/notifications";

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return apiError("Unauthorized", 401);
  }

  const [queueResults, renewals] = await Promise.all([
    processNotificationQueue(100),
    processRenewalReminders(),
  ]);

  return apiSuccess({
    queueProcessed: queueResults.filter(Boolean).length,
    renewalReminders: renewals.processed,
  });
}
