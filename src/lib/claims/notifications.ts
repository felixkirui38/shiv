import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/sms";
import type { ClaimCommunicationChannel, ClaimStatus } from "@/generated/prisma/client";
import { CLAIM_STATUS_LABELS } from "@/lib/claims/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254700652040";

export function buildWhatsAppClaimLink(params: {
  claimNumber: string;
  customerName?: string;
  message?: string;
}) {
  const text =
    params.message ??
    `Hello Shiv Insurance, regarding my claim ${params.claimNumber}` +
      (params.customerName ? ` (${params.customerName})` : "");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

async function logCommunication(params: {
  claimId: string;
  channel: ClaimCommunicationChannel;
  subject?: string;
  message: string;
  sentById?: string;
  recipient?: string;
  status: string;
}) {
  return prisma.claimCommunication.create({
    data: {
      claimId: params.claimId,
      channel: params.channel,
      subject: params.subject,
      message: params.message,
      sentById: params.sentById,
      recipient: params.recipient,
      status: params.status,
    },
  });
}

export async function notifyClaimStatusChange(params: {
  claimId: string;
  claimNumber: string;
  customerUserId: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerName: string;
  newStatus: ClaimStatus;
  message?: string;
  channels?: ClaimCommunicationChannel[];
}) {
  const statusLabel = CLAIM_STATUS_LABELS[params.newStatus];
  const body =
    params.message ??
    `Your claim ${params.claimNumber} status has been updated to: ${statusLabel}.`;
  const channels = params.channels ?? ["EMAIL", "IN_APP"];

  await prisma.notification.create({
    data: {
      userId: params.customerUserId,
      type: "IN_APP",
      title: `Claim ${params.claimNumber} — ${statusLabel}`,
      message: body,
      link: `/portal/claims/${params.claimId}`,
    },
  });

  if (channels.includes("IN_APP")) {
    await logCommunication({
      claimId: params.claimId,
      channel: "IN_APP",
      message: body,
      status: "sent",
    });
  }

  if (channels.includes("EMAIL")) {
    try {
      await sendEmail({
        to: params.customerEmail,
        subject: `Claim Update — ${params.claimNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #002B30;">Shiv Insurance — Claim Update</h2>
            <p>Dear ${params.customerName},</p>
            <p>${body}</p>
            <p><a href="${APP_URL}/portal/claims/${params.claimId}">Track your claim</a></p>
          </div>
        `,
      });
      await logCommunication({
        claimId: params.claimId,
        channel: "EMAIL",
        subject: `Claim Update — ${params.claimNumber}`,
        message: body,
        recipient: params.customerEmail,
        status: "sent",
      });
    } catch {
      await logCommunication({
        claimId: params.claimId,
        channel: "EMAIL",
        subject: `Claim Update — ${params.claimNumber}`,
        message: body,
        recipient: params.customerEmail,
        status: "failed",
      });
    }
  }

  if (channels.includes("SMS") && params.customerPhone) {
    const sms = await sendSms({ to: params.customerPhone, message: body });
    await logCommunication({
      claimId: params.claimId,
      channel: "SMS",
      message: body,
      recipient: params.customerPhone,
      status: sms.sent ? "sent" : "failed",
    });
  }

  if (channels.includes("WHATSAPP") && params.customerPhone) {
    const waLink = buildWhatsAppClaimLink({
      claimNumber: params.claimNumber,
      customerName: params.customerName,
      message: body,
    });
    await logCommunication({
      claimId: params.claimId,
      channel: "WHATSAPP",
      message: `${body}\n\nContact link: ${waLink}`,
      recipient: params.customerPhone,
      status: "queued",
    });
  }
}

export async function notifyAdminsNewClaim(params: {
  claimId: string;
  claimNumber: string;
  policyNumber: string;
  customerName: string;
  claimAmount: number;
}) {
  const staff = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER", "CLAIMS_OFFICER"] },
      status: "ACTIVE",
    },
    select: { id: true, email: true },
  });

  for (const user of staff) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "IN_APP",
        title: "New Claim Submitted",
        message: `${params.customerName} filed claim ${params.claimNumber} on policy ${params.policyNumber}`,
        link: `/admin/claims/${params.claimId}`,
      },
    });
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    try {
      await sendEmail({
        to: adminEmail,
        subject: `New Claim: ${params.claimNumber}`,
        html: `
          <h2>New Insurance Claim</h2>
          <p><strong>Claim:</strong> ${params.claimNumber}</p>
          <p><strong>Policy:</strong> ${params.policyNumber}</p>
          <p><strong>Customer:</strong> ${params.customerName}</p>
          <p><strong>Amount:</strong> KES ${params.claimAmount.toLocaleString()}</p>
          <p><a href="${APP_URL}/admin/claims/${params.claimId}">Review in Admin</a></p>
        `,
      });
    } catch {
      // optional
    }
  }
}

export async function sendClaimCommunication(params: {
  claimId: string;
  customerUserId: string;
  sentById: string;
  channel: ClaimCommunicationChannel;
  subject?: string;
  message: string;
  recipientEmail?: string;
  recipientPhone?: string;
  customerName: string;
  claimNumber: string;
}) {
  let status = "sent";

  if (params.channel === "EMAIL" && params.recipientEmail) {
    try {
      await sendEmail({
        to: params.recipientEmail,
        subject: params.subject ?? `Claim ${params.claimNumber}`,
        html: `<p>Dear ${params.customerName},</p><p>${params.message}</p>`,
      });
    } catch {
      status = "failed";
    }
  } else if (params.channel === "SMS" && params.recipientPhone) {
    const sms = await sendSms({ to: params.recipientPhone, message: params.message });
    status = sms.sent ? "sent" : "failed";
  } else if (params.channel === "WHATSAPP" && params.recipientPhone) {
    status = "queued";
  } else if (params.channel === "IN_APP") {
    await prisma.notification.create({
      data: {
        userId: params.customerUserId,
        type: "IN_APP",
        title: params.subject ?? `Claim ${params.claimNumber}`,
        message: params.message,
        link: `/portal/claims/${params.claimId}`,
      },
    });
  }

  return logCommunication({
    claimId: params.claimId,
    channel: params.channel,
    subject: params.subject,
    message: params.message,
    sentById: params.sentById,
    recipient: params.recipientEmail ?? params.recipientPhone,
    status,
  });
}
