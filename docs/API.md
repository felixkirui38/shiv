# Shiv Insurance Platform — API Plan

Complete REST API specification for all platform endpoints.

**Base URL**: `/api`  
**Auth**: Session cookie (NextAuth) or `Authorization: Bearer <token>`  
**Response Format**: `{ success: boolean, data?: T, error?: string, message?: string }`

---

## 1. Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | Public | NextAuth handlers (login, logout, session) |
| POST | `/api/auth/register` | Public | Customer registration |
| POST | `/api/auth/forgot-password` | Public | Send password reset email |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| GET | `/api/auth/me` | User | Get current user profile |

### POST `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

---

## 2. Insurance Products (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | Public | List all active products |
| GET | `/api/products/[slug]` | Public | Get product with features, benefits, coverage |
| GET | `/api/products/[slug]/form` | Public | Get application form definition |
| POST | `/api/products/[slug]/calculate` | Public | Premium calculator |
| POST | `/api/products/[slug]/quote` | Optional | Request a quote |
| POST | `/api/products/[slug]/apply` | Optional | Submit application |

### POST `/api/products/[slug]/calculate`
```json
{
  "coverageAmount": 50000,
  "deductible": 500,
  "factors": {
    "age": 35,
    "vehicleYear": 2022,
    "drivingRecord": "clean"
  }
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "basePremium": 1200,
    "adjustments": [{ "name": "Age discount", "amount": -120 }],
    "totalPremium": 1080,
    "monthlyPremium": 90
  }
}
```

---

## 3. Quotes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/quotes` | User | List user's quotes |
| GET | `/api/quotes/[id]` | User/Staff | Get quote details |
| POST | `/api/quotes` | User | Create quote |
| PATCH | `/api/quotes/[id]` | User/Staff | Update quote |
| POST | `/api/quotes/[id]/accept` | User | Accept quote → initiate checkout |
| POST | `/api/quotes/[id]/convert` | Staff | Convert quote to policy |

---

## 4. Policies

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/policies` | User/Staff | List policies (filtered by role) |
| GET | `/api/policies/[id]` | User/Staff | Get policy details |
| POST | `/api/policies` | Staff | Create policy manually |
| PATCH | `/api/policies/[id]` | Staff | Update policy |
| POST | `/api/policies/[id]/renew` | User/Staff | Initiate renewal |
| GET | `/api/policies/[id]/documents` | User/Staff | List policy documents |
| GET | `/api/policies/[id]/documents/[docId]/download` | User/Staff | Download document PDF |

---

## 5. Claims

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/claims` | User/Staff | List claims |
| GET | `/api/claims/[id]` | User/Staff | Get claim with history |
| POST | `/api/claims` | User | File new claim |
| PATCH | `/api/claims/[id]` | Staff | Update claim |
| POST | `/api/claims/[id]/status` | Staff | Change claim status |
| POST | `/api/claims/[id]/assign` | Staff | Assign claims officer |
| POST | `/api/claims/[id]/notes` | Staff | Add internal note |
| POST | `/api/claims/[id]/documents` | User/Staff | Upload claim document |
| POST | `/api/claims/[id]/approve` | Staff | Approve claim with amount |
| POST | `/api/claims/[id]/reject` | Staff | Reject claim with reason |

### POST `/api/claims`
```json
{
  "policyId": "clx...",
  "incidentDate": "2026-06-15",
  "description": "Vehicle collision on highway",
  "claimAmount": 5000,
  "formData": { "location": "Highway 101", "policeReport": true }
}
```

---

## 6. Payments (Stripe)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/checkout` | User | Create Stripe checkout session |
| GET | `/api/payments` | User/Staff | Payment history |
| GET | `/api/payments/[id]` | User/Staff | Payment details |
| POST | `/api/payments/[id]/refund` | Finance | Process refund |
| POST | `/api/webhooks/stripe` | Stripe | Webhook handler (no auth) |

### POST `/api/payments/checkout`
```json
{
  "type": "ONE_TIME",
  "quoteId": "clx...",
  "successUrl": "/portal/policies?success=true",
  "cancelUrl": "/products/motor-insurance?cancelled=true"
}
```
**Response**:
```json
{
  "success": true,
  "data": { "checkoutUrl": "https://checkout.stripe.com/..." }
}
```

### Stripe Webhook Events Handled
- `checkout.session.completed` — Activate policy, create payment record
- `invoice.paid` — Mark invoice paid
- `invoice.payment_failed` — Notify customer
- `customer.subscription.updated` — Sync subscription status
- `customer.subscription.deleted` — Handle cancellation
- `charge.refunded` — Update payment refund status

---

## 7. Subscriptions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subscriptions` | User/Staff | List subscriptions |
| GET | `/api/subscriptions/[id]` | User/Staff | Subscription details |
| POST | `/api/subscriptions/[id]/cancel` | User/Staff | Cancel at period end |
| POST | `/api/subscriptions/[id]/resume` | User | Resume cancelled subscription |

---

## 8. Invoices

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/invoices` | User/Staff | List invoices |
| GET | `/api/invoices/[id]` | User/Staff | Invoice details |
| POST | `/api/invoices` | Finance | Create invoice |
| PATCH | `/api/invoices/[id]` | Finance | Update invoice |
| POST | `/api/invoices/[id]/send` | Finance | Email invoice to customer |
| GET | `/api/invoices/[id]/pdf` | User/Staff | Generate/download PDF |

---

## 9. Dynamic Forms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/forms/[slug]` | Public | Get form definition with fields |
| POST | `/api/forms/[slug]/submit` | Optional | Submit completed form |
| POST | `/api/forms/[slug]/draft` | Optional | Save draft (autosave) |
| GET | `/api/forms/[slug]/draft` | Optional | Retrieve saved draft |
| DELETE | `/api/forms/[slug]/draft` | Optional | Delete draft |

### POST `/api/forms/[slug]/draft`
```json
{
  "sessionId": "sess_abc123",
  "data": { "step1": { "firstName": "John" }, "currentStep": 2 }
}
```

---

## 10. Media (Cloudinary)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/media/upload` | User/Staff | Upload file to Cloudinary |
| GET | `/api/media` | Staff | List media library |
| GET | `/api/media/[id]` | Staff | Get media details |
| DELETE | `/api/media/[id]` | Staff | Delete media |
| GET | `/api/media/folders` | Staff | List media folders |
| POST | `/api/media/folders` | Staff | Create folder |

---

## 11. CMS — Public Content

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cms/pages/[slug]` | Public | Get CMS page content |
| GET | `/api/cms/sections` | Public | Get website sections for homepage |
| GET | `/api/cms/blog` | Public | List published blog posts |
| GET | `/api/cms/blog/[slug]` | Public | Get blog post |
| GET | `/api/cms/testimonials` | Public | Active testimonials |
| GET | `/api/cms/faqs` | Public | Active FAQs |
| GET | `/api/cms/partners` | Public | Active partners |
| GET | `/api/cms/statistics` | Public | Homepage statistics |

---

## 12. Leads & Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/leads` | Public | Create lead from quote request |
| POST | `/api/contact` | Public | Contact form submission |
| POST | `/api/careers/apply` | Public | Career application with resume |

### POST `/api/contact`
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "subject": "Motor insurance inquiry",
  "message": "I need a quote for my new car."
}
```

---

## 13. Admin — Users

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| GET | `/api/admin/users` | Staff | `users:view` |
| GET | `/api/admin/users/[id]` | Staff | `users:view` |
| POST | `/api/admin/users` | Admin | `users:create` |
| PATCH | `/api/admin/users/[id]` | Admin | `users:edit` |
| DELETE | `/api/admin/users/[id]` | Admin | `users:delete` |
| PATCH | `/api/admin/users/[id]/role` | Admin | `users:edit` |
| PATCH | `/api/admin/users/[id]/status` | Admin | `users:edit` |

---

## 14. Admin — Products

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| GET | `/api/admin/products` | Staff | `products:manage` |
| GET | `/api/admin/products/[id]` | Staff | `products:manage` |
| PATCH | `/api/admin/products/[id]` | Staff | `products:manage` |
| POST | `/api/admin/products/[id]/features` | Staff | `products:manage` |
| POST | `/api/admin/products/[id]/benefits` | Staff | `products:manage` |
| POST | `/api/admin/products/[id]/coverages` | Staff | `products:manage` |
| POST | `/api/admin/products/[id]/premium-rules` | Staff | `products:manage` |

---

## 15. Admin — CMS Management

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| GET/POST | `/api/admin/cms/pages` | Staff | `cms:manage` |
| GET/PATCH/DELETE | `/api/admin/cms/pages/[id]` | Staff | `cms:manage` |
| GET/POST | `/api/admin/cms/sections` | Staff | `cms:manage` |
| PATCH/DELETE | `/api/admin/cms/sections/[id]` | Staff | `cms:manage` |
| GET/POST | `/api/admin/cms/blog` | Staff | `blog:manage` |
| GET/PATCH/DELETE | `/api/admin/cms/blog/[id]` | Staff | `blog:manage` |
| GET/POST | `/api/admin/cms/testimonials` | Staff | `cms:manage` |
| GET/POST | `/api/admin/cms/faqs` | Staff | `cms:manage` |
| GET/POST | `/api/admin/cms/partners` | Staff | `cms:manage` |
| GET/POST | `/api/admin/cms/statistics` | Staff | `cms:manage` |

---

## 16. Admin — Leads & Contact

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| GET | `/api/admin/leads` | Staff | `leads:view` |
| GET | `/api/admin/leads/[id]` | Staff | `leads:view` |
| PATCH | `/api/admin/leads/[id]` | Staff | `leads:manage` |
| POST | `/api/admin/leads/[id]/assign` | Staff | `leads:manage` |
| GET | `/api/admin/contact` | Staff | `leads:view` |
| PATCH | `/api/admin/contact/[id]` | Staff | `leads:manage` |
| GET | `/api/admin/careers` | Staff | `leads:view` |

---

## 17. Admin — Forms

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| GET/POST | `/api/admin/forms` | Staff | `products:manage` |
| GET/PATCH/DELETE | `/api/admin/forms/[id]` | Staff | `products:manage` |
| POST | `/api/admin/forms/[id]/fields` | Staff | `products:manage` |
| PATCH/DELETE | `/api/admin/forms/[id]/fields/[fieldId]` | Staff | `products:manage` |
| GET | `/api/admin/forms/[id]/submissions` | Staff | `products:manage` |

---

## 18. Admin — Reports

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| GET | `/api/admin/reports/dashboard` | Staff | `reports:view` |
| GET | `/api/admin/reports/policies` | Staff | `reports:view` |
| GET | `/api/admin/reports/claims` | Staff | `reports:view` |
| GET | `/api/admin/reports/revenue` | Finance | `reports:view` |
| GET | `/api/admin/reports/leads` | Staff | `reports:view` |
| GET | `/api/admin/reports/export` | Staff | `reports:view` |

### GET `/api/admin/reports/dashboard`
**Response**:
```json
{
  "success": true,
  "data": {
    "totalPolicies": 1250,
    "activePolicies": 980,
    "pendingClaims": 45,
    "monthlyRevenue": 125000,
    "newLeads": 89,
    "conversionRate": 12.5
  }
}
```

---

## 19. Admin — Settings

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| GET | `/api/admin/settings` | Admin | `settings:manage` |
| PATCH | `/api/admin/settings` | Admin | `settings:manage` |
| GET/POST | `/api/admin/settings/email-templates` | Admin | `settings:manage` |
| PATCH | `/api/admin/settings/email-templates/[id]` | Admin | `settings:manage` |

---

## 20. Customer Portal

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/portal/dashboard` | Customer | Dashboard summary |
| GET | `/api/portal/profile` | Customer | Get profile |
| PATCH | `/api/portal/profile` | Customer | Update profile |
| PATCH | `/api/portal/profile/password` | Customer | Change password |
| GET | `/api/portal/notifications` | Customer | List notifications |
| PATCH | `/api/portal/notifications/[id]/read` | Customer | Mark as read |

---

## 21. Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 401 | `UNAUTHORIZED` | Not authenticated |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate resource |
| 422 | `BUSINESS_RULE_ERROR` | Valid input but business rule violation |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## 22. Pagination & Filtering

All list endpoints support:
```
GET /api/policies?page=1&limit=20&status=ACTIVE&sort=createdAt&order=desc
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 23. Webhook Security

### Stripe Webhook Verification
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## 24. API Route File Mapping

```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts
│   ├── register/route.ts
│   ├── forgot-password/route.ts
│   ├── reset-password/route.ts
│   └── me/route.ts
├── products/
│   ├── route.ts
│   └── [slug]/
│       ├── route.ts
│       ├── calculate/route.ts
│       ├── quote/route.ts
│       ├── apply/route.ts
│       └── form/route.ts
├── quotes/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── accept/route.ts
│       └── convert/route.ts
├── policies/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── renew/route.ts
│       └── documents/
│           ├── route.ts
│           └── [docId]/download/route.ts
├── claims/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── status/route.ts
│       ├── assign/route.ts
│       ├── notes/route.ts
│       ├── documents/route.ts
│       ├── approve/route.ts
│       └── reject/route.ts
├── payments/
│   ├── route.ts
│   ├── checkout/route.ts
│   └── [id]/
│       ├── route.ts
│       └── refund/route.ts
├── subscriptions/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── cancel/route.ts
│       └── resume/route.ts
├── invoices/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── send/route.ts
│       └── pdf/route.ts
├── forms/
│   └── [slug]/
│       ├── route.ts
│       ├── submit/route.ts
│       └── draft/route.ts
├── media/
│   ├── route.ts
│   ├── upload/route.ts
│   ├── folders/route.ts
│   └── [id]/route.ts
├── cms/
│   ├── pages/[slug]/route.ts
│   ├── sections/route.ts
│   ├── blog/
│   │   ├── route.ts
│   │   └── [slug]/route.ts
│   ├── testimonials/route.ts
│   ├── faqs/route.ts
│   ├── partners/route.ts
│   └── statistics/route.ts
├── leads/route.ts
├── contact/route.ts
├── careers/apply/route.ts
├── portal/
│   ├── dashboard/route.ts
│   ├── profile/
│   │   ├── route.ts
│   │   └── password/route.ts
│   └── notifications/
│       ├── route.ts
│       └── [id]/read/route.ts
├── admin/
│   ├── users/
│   ├── products/
│   ├── cms/
│   ├── leads/
│   ├── contact/
│   ├── careers/
│   ├── forms/
│   ├── reports/
│   └── settings/
└── webhooks/
    └── stripe/route.ts
```
