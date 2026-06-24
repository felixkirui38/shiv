import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/sms";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254700652040";

export async function deliverEmail(params: {
  to: string;
  subject: string;
  body: string;
}) {
  await sendEmail({
    to: params.to,
    subject: params.subject,
    html: params.body,
  });
  return { success: true };
}

export async function deliverSms(params: { to: string; body: string }) {
  const result = await sendSms({ to: params.to, message: params.body });
  if (!result.sent) {
    throw new Error(result.reason ?? "SMS delivery failed");
  }
  return { success: true, metadata: result.data };
}

export async function deliverWhatsApp(params: { to: string; body: string }) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (apiUrl && apiToken) {
    const phone = params.to.replace(/\D/g, "");
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        to: phone.startsWith("254") ? phone : `254${phone.replace(/^0/, "")}`,
        message: params.body,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "WhatsApp API failed");
    }
    return { success: true, metadata: await res.json().catch(() => ({})) };
  }

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(params.body)}`;
  return {
    success: true,
    metadata: { method: "wa_me_link", url: waLink },
  };
}

export async function deliverInApp(params: {
  userId: string;
  title: string;
  body: string;
  link?: string;
}) {
  const { prisma } = await import("@/lib/prisma");
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: "IN_APP",
      title: params.title,
      message: params.body,
      link: params.link,
    },
  });
  return { success: true };
}
