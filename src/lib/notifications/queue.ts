import { prisma } from "@/lib/prisma";
import type {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEvent,
} from "@/types/notifications";
import {
  deliverEmail,
  deliverInApp,
  deliverSms,
  deliverWhatsApp,
} from "./channels";
import { renderTemplate } from "./templates";

interface EnqueueParams {
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient: string;
  userId?: string;
  subject?: string;
  body: string;
  payload?: Record<string, string>;
  scheduledAt?: Date;
}

export async function enqueueNotification(params: EnqueueParams) {
  return prisma.notificationQueue.create({
    data: {
      event: params.event,
      channel: params.channel,
      recipient: params.recipient,
      userId: params.userId,
      subject: params.subject,
      body: params.body,
      payload: params.payload as object | undefined,
      scheduledAt: params.scheduledAt ?? new Date(),
    },
  });
}

async function writeLog(params: {
  queueId?: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  recipient?: string;
  userId?: string;
  subject?: string;
  body?: string;
  metadata?: unknown;
  error?: string;
}) {
  return prisma.notificationLog.create({
    data: {
      queueId: params.queueId,
      event: params.event,
      channel: params.channel,
      status: params.status,
      recipient: params.recipient,
      userId: params.userId,
      subject: params.subject,
      body: params.body,
      metadata: params.metadata as object | undefined,
      error: params.error,
    },
  });
}

async function deliverJob(job: {
  id: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient: string;
  userId: string | null;
  subject: string | null;
  body: string;
  attempts: number;
  maxAttempts: number;
  payload: unknown;
}) {
  const link =
    job.payload && typeof job.payload === "object" && "link" in job.payload
      ? String((job.payload as { link?: string }).link ?? "")
      : undefined;

  switch (job.channel) {
    case "EMAIL":
      await deliverEmail({
        to: job.recipient,
        subject: job.subject ?? "Shiv Insurance",
        body: job.body,
      });
      break;
    case "SMS":
      await deliverSms({ to: job.recipient, body: stripHtml(job.body) });
      break;
    case "WHATSAPP": {
      const result = await deliverWhatsApp({ to: job.recipient, body: stripHtml(job.body) });
      await writeLog({
        queueId: job.id,
        event: job.event,
        channel: job.channel,
        status: "SENT",
        recipient: job.recipient,
        userId: job.userId ?? undefined,
        body: job.body,
        metadata: result.metadata,
      });
      return result;
    }
    case "IN_APP":
      if (!job.userId) throw new Error("userId required for in-app notifications");
      await deliverInApp({
        userId: job.userId,
        title: job.subject ?? "Notification",
        body: stripHtml(job.body),
        link,
      });
      break;
  }
  return { success: true };
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function processQueueItem(jobId: string) {
  const job = await prisma.notificationQueue.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "QUEUED") return null;

  await prisma.notificationQueue.update({
    where: { id: jobId },
    data: { status: "PROCESSING", attempts: { increment: 1 } },
  });

  try {
    const result = await deliverJob(job);
    await prisma.notificationQueue.update({
      where: { id: jobId },
      data: { status: "SENT", processedAt: new Date(), lastError: null },
    });
    if (job.channel !== "WHATSAPP") {
      await writeLog({
        queueId: jobId,
        event: job.event,
        channel: job.channel,
        status: "SENT",
        recipient: job.recipient,
        userId: job.userId ?? undefined,
        subject: job.subject ?? undefined,
        body: job.body,
        metadata: result,
      });
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delivery failed";
    const failed = job.attempts + 1 >= job.maxAttempts;
    await prisma.notificationQueue.update({
      where: { id: jobId },
      data: {
        status: failed ? "FAILED" : "QUEUED",
        lastError: message,
        scheduledAt: failed ? job.scheduledAt : new Date(Date.now() + 60_000 * job.attempts),
      },
    });
    await writeLog({
      queueId: jobId,
      event: job.event,
      channel: job.channel,
      status: "FAILED",
      recipient: job.recipient,
      userId: job.userId ?? undefined,
      error: message,
    });
    return { success: false, error: message };
  }
}

export async function processNotificationQueue(limit = 25) {
  const jobs = await prisma.notificationQueue.findMany({
    where: {
      status: "QUEUED",
      scheduledAt: { lte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  const results = [];
  for (const job of jobs) {
    if (job.attempts >= job.maxAttempts) {
      await prisma.notificationQueue.update({
        where: { id: job.id },
        data: { status: "FAILED", lastError: "Max attempts exceeded" },
      });
      continue;
    }
    results.push(await processQueueItem(job.id));
  }
  return results;
}

export async function listQueue(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 25;
  const skip = (page - 1) * limit;

  const where = filters?.status
    ? { status: filters.status as NotificationDeliveryStatus }
    : {};

  const [items, total] = await Promise.all([
    prisma.notificationQueue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notificationQueue.count({ where }),
  ]);

  return {
    items: items.map((j) => ({
      ...j,
      createdAt: j.createdAt.toISOString(),
      scheduledAt: j.scheduledAt.toISOString(),
      processedAt: j.processedAt?.toISOString() ?? null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listLogs(filters?: {
  event?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 25;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters?.event ? { event: filters.event as NotificationEvent } : {}),
    ...(filters?.status
      ? { status: filters.status as NotificationDeliveryStatus }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notificationLog.count({ where }),
  ]);

  return {
    items: items.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export { renderTemplate };
