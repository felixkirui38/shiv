import { prisma } from "@/lib/prisma";
import type { NotificationChannel, NotifyParams } from "@/types/notifications";
import { NOTIFICATION_EVENT_LABELS } from "@/config/notification.defaults";
import { getTemplatesForEvent } from "./templates";
import { enqueueNotification, processNotificationQueue, renderTemplate } from "./queue";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "info@shivinsbro.co.ke";

function resolveRecipient(
  channel: NotificationChannel,
  params: NotifyParams
): { recipient: string; userId?: string } | null {
  switch (channel) {
    case "EMAIL":
      return params.email ? { recipient: params.email } : null;
    case "SMS":
    case "WHATSAPP":
      return params.phone ? { recipient: params.phone } : null;
    case "IN_APP":
      return params.userId ? { recipient: params.userId, userId: params.userId } : null;
    default:
      return null;
  }
}

export async function notify(params: NotifyParams) {
  const templates = await getTemplatesForEvent(params.event);
  const activeChannels =
    params.channels ?? (templates.map((t) => t.channel) as NotificationChannel[]);

  const enqueued = [];

  for (const channel of activeChannels) {
    const template = templates.find((t) => t.channel === channel && t.isActive);
    if (!template) continue;

    const body = renderTemplate(template.body, params.variables);
    const subject = template.subject
      ? renderTemplate(template.subject, params.variables)
      : undefined;

    const target = resolveRecipient(channel, params);
    if (!target) continue;

    const job = await enqueueNotification({
      event: params.event,
      channel,
      recipient: target.recipient,
      userId: target.userId ?? params.userId,
      subject,
      body,
      payload: {
        ...params.variables,
        ...(params.link ? { link: params.link } : {}),
      },
      scheduledAt: params.scheduledAt,
    });
    enqueued.push(job);
  }

  processNotificationQueue().catch(() => {});

  return enqueued;
}

export async function notifyStaff(params: {
  event: NotifyParams["event"];
  variables: Record<string, string>;
  roles?: ("ADMIN" | "MANAGER" | "CLAIMS_OFFICER" | "FINANCE")[];
  link?: string;
}) {
  const roles = params.roles ?? ["ADMIN", "MANAGER"];
  const staff = await prisma.user.findMany({
    where: { role: { in: roles }, status: "ACTIVE" },
    select: { id: true, email: true },
  });

  for (const user of staff) {
    await notify({
      event: params.event,
      variables: params.variables,
      userId: user.id,
      channels: ["IN_APP"],
      link: params.link,
    });
  }

  if (ADMIN_EMAIL) {
    const summary = Object.entries(params.variables)
      .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
      .join("");
    await enqueueNotification({
      event: params.event,
      channel: "EMAIL",
      recipient: ADMIN_EMAIL,
      subject: `[Admin] ${NOTIFICATION_EVENT_LABELS[params.event]}`,
      body: `<h2>${NOTIFICATION_EVENT_LABELS[params.event]}</h2>${summary}`,
      payload: params.variables,
    });
  }

  processNotificationQueue().catch(() => {});
}

export async function emitQuoteCreated(params: {
  quoteId: string;
  quoteNumber: string;
  productName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  premium: number;
  resumeToken: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
  const variables = {
    customerName: params.customerName,
    quoteNumber: params.quoteNumber,
    productName: params.productName,
    premium: params.premium.toLocaleString(),
    customerEmail: params.customerEmail ?? "",
    resumeLink: `${appUrl}/quote/resume/${params.resumeToken}`,
    adminLink: `${appUrl}/admin/quotes`,
  };

  if (params.customerEmail) {
    await notify({
      event: "QUOTE_CREATED",
      variables,
      email: params.customerEmail,
      phone: params.customerPhone,
      channels: ["EMAIL", "SMS"],
    });
  }

  await notifyStaff({
    event: "QUOTE_CREATED",
    variables,
    link: `/admin/quotes`,
  });
}

export async function emitPolicyApproved(params: {
  userId: string;
  email: string;
  phone?: string | null;
  customerName: string;
  policyNumber: string;
  productName: string;
  policyId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
  await notify({
    event: "POLICY_APPROVED",
    variables: {
      customerName: params.customerName,
      policyNumber: params.policyNumber,
      productName: params.productName,
      portalLink: `${appUrl}/portal/policies`,
    },
    userId: params.userId,
    email: params.email,
    phone: params.phone ?? undefined,
    link: `/portal/policies`,
  });
}

export async function emitPaymentReceived(params: {
  userId: string;
  email: string;
  phone?: string | null;
  customerName: string;
  amount: number;
  description: string;
  paymentReference: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
  await notify({
    event: "PAYMENT_RECEIVED",
    variables: {
      customerName: params.customerName,
      amount: params.amount.toLocaleString(),
      description: params.description,
      paymentReference: params.paymentReference,
      portalLink: `${appUrl}/portal/payments`,
    },
    userId: params.userId,
    email: params.email,
    phone: params.phone ?? undefined,
    link: `/portal/payments`,
  });
}

export async function emitRenewalReminder(params: {
  userId: string;
  email: string;
  phone?: string | null;
  customerName: string;
  policyNumber: string;
  productName: string;
  renewalDate: string;
  policyId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
  await notify({
    event: "RENEWAL_REMINDER",
    variables: {
      customerName: params.customerName,
      policyNumber: params.policyNumber,
      productName: params.productName,
      renewalDate: params.renewalDate,
      renewalLink: `${appUrl}/portal/renewals`,
    },
    userId: params.userId,
    email: params.email,
    phone: params.phone ?? undefined,
    link: `/portal/renewals`,
  });
}

export async function emitClaimSubmitted(params: {
  claimId: string;
  claimNumber: string;
  policyNumber: string;
  customerUserId: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerName: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
  await notify({
    event: "CLAIM_SUBMITTED",
    variables: {
      customerName: params.customerName,
      claimNumber: params.claimNumber,
      claimLink: `${appUrl}/portal/claims/${params.claimId}`,
    },
    userId: params.customerUserId,
    email: params.customerEmail,
    phone: params.customerPhone ?? undefined,
    link: `/portal/claims/${params.claimId}`,
    channels: ["EMAIL", "IN_APP"],
  });

  await notifyStaff({
    event: "CLAIM_SUBMITTED",
    variables: {
      customerName: params.customerName,
      claimNumber: params.claimNumber,
      policyNumber: params.policyNumber,
      adminLink: `${appUrl}/admin/claims/${params.claimId}`,
    },
    roles: ["ADMIN", "MANAGER", "CLAIMS_OFFICER"],
    link: `/admin/claims/${params.claimId}`,
  });
}

export async function emitClaimApproved(params: {
  claimId: string;
  claimNumber: string;
  customerUserId: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerName: string;
  message: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
  await notify({
    event: "CLAIM_APPROVED",
    variables: {
      customerName: params.customerName,
      claimNumber: params.claimNumber,
      message: params.message,
      claimLink: `${appUrl}/portal/claims/${params.claimId}`,
    },
    userId: params.customerUserId,
    email: params.customerEmail,
    phone: params.customerPhone ?? undefined,
    link: `/portal/claims/${params.claimId}`,
  });
}

export async function emitPasswordReset(params: {
  email: string;
  phone?: string | null;
  customerName: string;
  resetToken: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";
  await notify({
    event: "PASSWORD_RESET",
    variables: {
      customerName: params.customerName,
      resetLink: `${appUrl}/reset-password?token=${params.resetToken}`,
    },
    email: params.email,
    phone: params.phone ?? undefined,
    channels: ["EMAIL", "SMS"],
  });
}

export async function processRenewalReminders() {
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const policies = await prisma.policy.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ renewalDate: { lte: in30Days } }, { endDate: { lte: in30Days } }],
    },
    include: {
      user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } },
      product: { select: { name: true } },
    },
    take: 100,
  });

  let sent = 0;
  for (const policy of policies) {
    const renewalDate = policy.renewalDate ?? policy.endDate;
    if (!renewalDate) continue;

    await emitRenewalReminder({
      userId: policy.userId,
      email: policy.user.email,
      phone: policy.user.phone,
      customerName:
        `${policy.user.firstName ?? ""} ${policy.user.lastName ?? ""}`.trim() ||
        policy.user.email,
      policyNumber: policy.policyNumber,
      productName: policy.product.name,
      renewalDate: renewalDate.toLocaleDateString("en-KE"),
      policyId: policy.id,
    });
    sent++;
  }

  return { processed: sent };
}
