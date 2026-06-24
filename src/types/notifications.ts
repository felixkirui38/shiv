export type NotificationEvent =
  | "QUOTE_CREATED"
  | "POLICY_APPROVED"
  | "PAYMENT_RECEIVED"
  | "RENEWAL_REMINDER"
  | "CLAIM_SUBMITTED"
  | "CLAIM_APPROVED"
  | "PASSWORD_RESET";

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP";

export type NotificationDeliveryStatus =
  | "QUEUED"
  | "PROCESSING"
  | "SENT"
  | "FAILED"
  | "SKIPPED";

export interface NotifyParams {
  event: NotificationEvent;
  variables: Record<string, string>;
  userId?: string;
  email?: string;
  phone?: string;
  channels?: NotificationChannel[];
  scheduledAt?: Date;
  link?: string;
}
