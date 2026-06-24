import type { NotificationEvent, NotificationChannel } from "@/types/notifications";

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  QUOTE_CREATED: "Quote Created",
  POLICY_APPROVED: "Policy Approved",
  PAYMENT_RECEIVED: "Payment Received",
  RENEWAL_REMINDER: "Renewal Reminder",
  CLAIM_SUBMITTED: "Claim Submitted",
  CLAIM_APPROVED: "Claim Approved",
  PASSWORD_RESET: "Password Reset",
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  IN_APP: "In-App",
};

export interface DefaultNotificationTemplate {
  event: NotificationEvent;
  channel: NotificationChannel;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shivinsbro.co.ke";

export const defaultNotificationTemplates: DefaultNotificationTemplate[] = [
  {
    event: "QUOTE_CREATED",
    channel: "EMAIL",
    name: "Quote Created — Customer Email",
    subject: "Your Insurance Quote — {{quoteNumber}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #002B30;">Shiv Insurance Brokers</h2>
      <p>Dear {{customerName}},</p>
      <p>Your quote <strong>{{quoteNumber}}</strong> for {{productName}} is ready.</p>
      <p><strong>Premium:</strong> KES {{premium}}</p>
      <p><a href="{{resumeLink}}">Resume your quote</a></p>
    </div>`,
    variables: ["customerName", "quoteNumber", "productName", "premium", "resumeLink"],
  },
  {
    event: "QUOTE_CREATED",
    channel: "IN_APP",
    name: "Quote Created — Staff In-App",
    subject: "New Quote Request",
    body: "{{customerName}} requested a quote for {{productName}} — KES {{premium}}",
    variables: ["customerName", "productName", "premium", "adminLink"],
  },
  {
    event: "QUOTE_CREATED",
    channel: "SMS",
    name: "Quote Created — SMS",
    body: "Shiv Insurance: Your quote {{quoteNumber}} for {{productName}} is ready. Premium KES {{premium}}. {{resumeLink}}",
    variables: ["quoteNumber", "productName", "premium", "resumeLink"],
  },
  {
    event: "POLICY_APPROVED",
    channel: "EMAIL",
    name: "Policy Approved — Email",
    subject: "Policy Approved — {{policyNumber}}",
    body: `<p>Dear {{customerName}},</p>
      <p>Your policy <strong>{{policyNumber}}</strong> for {{productName}} has been approved and is now active.</p>
      <p><a href="{{portalLink}}">View in portal</a></p>`,
    variables: ["customerName", "policyNumber", "productName", "portalLink"],
  },
  {
    event: "POLICY_APPROVED",
    channel: "SMS",
    name: "Policy Approved — SMS",
    body: "Shiv Insurance: Policy {{policyNumber}} for {{productName}} is now active. View: {{portalLink}}",
    variables: ["policyNumber", "productName", "portalLink"],
  },
  {
    event: "POLICY_APPROVED",
    channel: "IN_APP",
    name: "Policy Approved — In-App",
    subject: "Policy Approved",
    body: "Your policy {{policyNumber}} for {{productName}} is now active.",
    variables: ["policyNumber", "productName", "portalLink"],
  },
  {
    event: "PAYMENT_RECEIVED",
    channel: "EMAIL",
    name: "Payment Received — Email",
    subject: "Payment Received — KES {{amount}}",
    body: `<p>Dear {{customerName}},</p>
      <p>We received your payment of <strong>KES {{amount}}</strong> for {{description}}.</p>
      <p>Reference: {{paymentReference}}</p>
      <p><a href="{{portalLink}}">View payment history</a></p>`,
    variables: ["customerName", "amount", "description", "paymentReference", "portalLink"],
  },
  {
    event: "PAYMENT_RECEIVED",
    channel: "SMS",
    name: "Payment Received — SMS",
    body: "Shiv Insurance: Payment of KES {{amount}} received. Ref: {{paymentReference}}",
    variables: ["amount", "paymentReference"],
  },
  {
    event: "PAYMENT_RECEIVED",
    channel: "IN_APP",
    name: "Payment Received — In-App",
    subject: "Payment Received",
    body: "Payment of KES {{amount}} received successfully.",
    variables: ["amount", "paymentReference", "portalLink"],
  },
  {
    event: "RENEWAL_REMINDER",
    channel: "EMAIL",
    name: "Renewal Reminder — Email",
    subject: "Policy Renewal Due — {{policyNumber}}",
    body: `<p>Dear {{customerName}},</p>
      <p>Your policy <strong>{{policyNumber}}</strong> for {{productName}} renews on {{renewalDate}}.</p>
      <p><a href="{{renewalLink}}">Renew now</a></p>`,
    variables: ["customerName", "policyNumber", "productName", "renewalDate", "renewalLink"],
  },
  {
    event: "RENEWAL_REMINDER",
    channel: "SMS",
    name: "Renewal Reminder — SMS",
    body: "Shiv Insurance: Policy {{policyNumber}} renews {{renewalDate}}. Renew: {{renewalLink}}",
    variables: ["policyNumber", "renewalDate", "renewalLink"],
  },
  {
    event: "RENEWAL_REMINDER",
    channel: "WHATSAPP",
    name: "Renewal Reminder — WhatsApp",
    body: "Hello {{customerName}}, your Shiv Insurance policy {{policyNumber}} renews on {{renewalDate}}. Reply or visit {{renewalLink}}",
    variables: ["customerName", "policyNumber", "renewalDate", "renewalLink"],
  },
  {
    event: "CLAIM_SUBMITTED",
    channel: "EMAIL",
    name: "Claim Submitted — Customer",
    subject: "Claim Submitted — {{claimNumber}}",
    body: `<p>Dear {{customerName}},</p>
      <p>We received your claim <strong>{{claimNumber}}</strong> and will review it shortly.</p>
      <p><a href="{{claimLink}}">Track your claim</a></p>`,
    variables: ["customerName", "claimNumber", "claimLink"],
  },
  {
    event: "CLAIM_SUBMITTED",
    channel: "IN_APP",
    name: "Claim Submitted — Staff Alert",
    subject: "New Claim Submitted",
    body: "{{customerName}} filed claim {{claimNumber}} on policy {{policyNumber}}",
    variables: ["customerName", "claimNumber", "policyNumber", "adminLink"],
  },
  {
    event: "CLAIM_APPROVED",
    channel: "EMAIL",
    name: "Claim Approved — Email",
    subject: "Claim Approved — {{claimNumber}}",
    body: `<p>Dear {{customerName}},</p>
      <p>Your claim <strong>{{claimNumber}}</strong> has been approved.</p>
      <p>{{message}}</p>
      <p><a href="{{claimLink}}">View details</a></p>`,
    variables: ["customerName", "claimNumber", "message", "claimLink"],
  },
  {
    event: "CLAIM_APPROVED",
    channel: "SMS",
    name: "Claim Approved — SMS",
    body: "Shiv Insurance: Claim {{claimNumber}} approved. {{message}}",
    variables: ["claimNumber", "message"],
  },
  {
    event: "CLAIM_APPROVED",
    channel: "WHATSAPP",
    name: "Claim Approved — WhatsApp",
    body: "Hello {{customerName}}, your claim {{claimNumber}} has been approved. {{message}}",
    variables: ["customerName", "claimNumber", "message"],
  },
  {
    event: "CLAIM_APPROVED",
    channel: "IN_APP",
    name: "Claim Approved — In-App",
    subject: "Claim {{claimNumber}} Approved",
    body: "{{message}}",
    variables: ["claimNumber", "message", "claimLink"],
  },
  {
    event: "PASSWORD_RESET",
    channel: "EMAIL",
    name: "Password Reset — Email",
    subject: "Reset Your Password — Shiv Insurance",
    body: `<p>Dear {{customerName}},</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="{{resetLink}}">Reset Password</a></p>
      <p>If you did not request this, ignore this email.</p>`,
    variables: ["customerName", "resetLink"],
  },
  {
    event: "PASSWORD_RESET",
    channel: "SMS",
    name: "Password Reset — SMS",
    body: "Shiv Insurance: Reset your password at {{resetLink}} (expires in 1 hour)",
    variables: ["resetLink"],
  },
];

export { APP_URL };
