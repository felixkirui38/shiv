import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "noreply@shivinsurance.com";

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const resend = getResend();
  return resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
  });
}

export async function sendTemplateEmail(params: {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, string>;
}) {
  let html = params.template;
  for (const [key, value] of Object.entries(params.variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return sendEmail({ to: params.to, subject: params.subject, html });
}
