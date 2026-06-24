# Payment Infrastructure — Architecture

Multi-provider payment platform for Shiv Insurance supporting **Stripe**, **Pesapal**, **Flutterwave**, and **M-Pesa**.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Customer Portal          Quote Wizard           Admin Portal                │
│  /portal/payments         /quote (step 8)        /admin/payments             │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POST /api/payments/checkout                               │
│                    Payment Gateway (src/lib/payments/gateway.ts)             │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
    ┌────────┐ ┌─────────┐ ┌───────────┐ ┌───────┐ ┌──────────┐
    │ Stripe │ │ Pesapal │ │Flutterwave│ │ M-Pesa│ │ Invoices │
    └────┬───┘ └────┬────┘ └─────┬─────┘ └───┬───┘ └────┬─────┘
         │          │            │           │          │
         └──────────┴────────────┴───────────┴──────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Webhooks: /api/webhooks/{stripe|pesapal|flutterwave|mpesa}                  │
│  → PaymentWebhookEvent audit → update Payment status → Receipt + Invoice       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Payment Status Model

| DB Status | UI Label | Description |
|-----------|----------|-------------|
| `PENDING` | Pending | Checkout initiated, awaiting customer |
| `PROCESSING` | Processing | Provider processing (e.g. M-Pesa STK) |
| `SUCCEEDED` | Paid | Payment confirmed |
| `FAILED` | Failed | Payment declined or timed out |
| `REFUNDED` | Refunded | Full refund issued |
| `PARTIALLY_REFUNDED` | Partially Refunded | Partial refund |
| `CANCELLED` | Cancelled | Abandoned or voided |

---

## 3. Plan Types

| Plan Type | Use Case |
|-----------|----------|
| `ONE_TIME` | Single premium payment |
| `SUBSCRIPTION` | Recurring monthly/quarterly via Stripe |
| `INSTALLMENT` | Split premium into N payments |
| `ANNUAL` | Yearly renewal plan |

---

## 4. Provider Adapters

Each provider implements `PaymentProviderAdapter`:

| Method | Purpose |
|--------|---------|
| `createCheckout` | Redirect or STK push |
| `createSubscription` | Recurring billing (Stripe) |
| `verifyWebhook` | Signature validation |
| `parseWebhook` | Normalize to `WebhookPaymentUpdate` |
| `refund` | Issue refund |

### Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Pesapal
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_IPN_SECRET=

# Flutterwave
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_WEBHOOK_SECRET=

# M-Pesa (Safaricom Daraja)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
```

---

## 5. Security

- **Webhook signature verification** per provider before processing
- **Idempotency** via `providerReference` unique constraint
- **Audit trail** in `payment_webhook_events`
- **RBAC** — refunds and exports require `payments:refund` / `reports:view`
- **No secrets in client** — checkout URLs generated server-side only
- **HTTPS** required for all webhook endpoints in production

---

## 6. API Surface

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/payments/checkout` | User/Session | Create checkout |
| `GET /api/payments` | Customer | Payment history |
| `GET /api/payments/invoices` | Customer | Invoice list |
| `GET /api/payments/invoices/[id]/receipt` | Customer | Download receipt PDF |
| `POST /api/payments/renewals/[policyId]` | Customer | Initiate renewal |
| `GET /api/admin/payments` | Staff | List + filter |
| `GET /api/admin/payments/reports` | Staff | Aggregates |
| `GET /api/admin/payments/export` | Staff | CSV export |
| `POST /api/admin/payments/[id]/refund` | Staff | Process refund |
| `POST /api/webhooks/*` | Provider signature | Webhook handlers |

---

## 7. File Structure

```
src/lib/payments/
├── types.ts
├── gateway.ts
├── checkout.ts
├── invoices.ts
├── receipts.ts
├── refunds.ts
├── webhooks.ts
├── queries.ts
└── providers/
    ├── stripe.ts
    ├── pesapal.ts
    ├── flutterwave.ts
    └── mpesa.ts
```
