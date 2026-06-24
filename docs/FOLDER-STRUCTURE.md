# Shiv Insurance Platform — Folder Structure

```
shiv/
├── docs/
│   ├── ARCHITECTURE.md          # System architecture & ERD
│   ├── API.md                   # Complete API specification
│   └── FOLDER-STRUCTURE.md      # This file
│
├── prisma/
│   ├── schema.prisma            # Database schema (40+ models)
│   ├── migrations/              # Migration history
│   └── seed.ts                  # Seed insurance products & CMS data
│
├── public/
│   ├── images/                  # Static images
│   ├── icons/                   # Favicons, app icons
│   └── documents/               # Static PDF templates
│
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public marketing site (no auth)
│   │   │   ├── layout.tsx               # Public layout (header, footer)
│   │   │   ├── page.tsx                 # Homepage
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx             # All products listing
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx         # Product detail page
│   │   │   │       ├── apply/
│   │   │   │       │   └── page.tsx     # Online application form
│   │   │   │       └── quote/
│   │   │   │           └── page.tsx     # Quote request page
│   │   │   ├── claims/
│   │   │   │   └── page.tsx             # Claims process info
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx             # Blog listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         # Blog post detail
│   │   │   ├── careers/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── faq/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   └── terms/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/                      # Authentication pages
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (portal)/                    # Customer portal (auth required)
│   │   │   ├── layout.tsx               # Portal sidebar layout
│   │   │   └── portal/
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx
│   │   │       ├── policies/
│   │   │       │   ├── page.tsx         # List policies
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx     # Policy detail
│   │   │       ├── claims/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── payments/
│   │   │       │   └── page.tsx
│   │   │       ├── invoices/
│   │   │       │   └── page.tsx
│   │   │       ├── renewals/
│   │   │       │   └── page.tsx
│   │   │       └── profile/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (admin)/                     # Admin CMS (staff auth required)
│   │   │   ├── layout.tsx               # Admin sidebar layout
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx         # Statistics dashboard
│   │   │       ├── users/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── policies/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── claims/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── products/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── payments/
│   │   │       │   └── page.tsx
│   │   │       ├── invoices/
│   │   │       │   └── page.tsx
│   │   │       ├── blog/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── testimonials/
│   │   │       │   └── page.tsx
│   │   │       ├── faqs/
│   │   │       │   └── page.tsx
│   │   │       ├── sections/
│   │   │       │   └── page.tsx         # Website sections CMS
│   │   │       ├── leads/
│   │   │       │   └── page.tsx
│   │   │       ├── contact/
│   │   │       │   └── page.tsx
│   │   │       ├── forms/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── media/
│   │   │       │   └── page.tsx
│   │   │       ├── reports/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/                         # API Routes (see docs/API.md)
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── quotes/
│   │   │   ├── policies/
│   │   │   ├── claims/
│   │   │   ├── payments/
│   │   │   ├── subscriptions/
│   │   │   ├── invoices/
│   │   │   ├── forms/
│   │   │   ├── media/
│   │   │   ├── cms/
│   │   │   ├── leads/
│   │   │   ├── contact/
│   │   │   ├── careers/
│   │   │   ├── portal/
│   │   │   ├── admin/
│   │   │   └── webhooks/
│   │   │
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                          # Shadcn UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── layout/                      # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── portal-sidebar.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   ├── public/                      # Public website sections
│   │   │   ├── hero.tsx
│   │   │   ├── services.tsx
│   │   │   ├── calculator.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── claims-process.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── statistics.tsx
│   │   │   ├── partners.tsx
│   │   │   ├── faq-section.tsx
│   │   │   ├── blog-preview.tsx
│   │   │   └── cta.tsx
│   │   │
│   │   ├── products/                    # Product-specific components
│   │   │   ├── product-card.tsx
│   │   │   ├── product-hero.tsx
│   │   │   ├── features-list.tsx
│   │   │   ├── benefits-list.tsx
│   │   │   ├── coverage-table.tsx
│   │   │   ├── premium-estimator.tsx
│   │   │   └── checkout-button.tsx
│   │   │
│   │   ├── forms/                       # Dynamic form system
│   │   │   ├── dynamic-form.tsx
│   │   │   ├── form-field.tsx
│   │   │   ├── conditional-field.tsx
│   │   │   ├── form-stepper.tsx
│   │   │   ├── autosave-indicator.tsx
│   │   │   └── draft-recovery.tsx
│   │   │
│   │   ├── portal/                      # Customer portal components
│   │   │   ├── policy-card.tsx
│   │   │   ├── claim-form.tsx
│   │   │   ├── claim-timeline.tsx
│   │   │   ├── payment-history.tsx
│   │   │   ├── invoice-list.tsx
│   │   │   └── document-download.tsx
│   │   │
│   │   ├── admin/                       # Admin CMS components
│   │   │   ├── stat-card.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── claim-review-panel.tsx
│   │   │   ├── refund-dialog.tsx
│   │   │   ├── cms-editor.tsx
│   │   │   ├── form-builder.tsx
│   │   │   ├── media-picker.tsx
│   │   │   └── report-chart.tsx
│   │   │
│   │   └── shared/                      # Shared utilities
│   │       ├── logo.tsx
│   │       ├── page-header.tsx
│   │       ├── empty-state.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── pagination.tsx
│   │       ├── search-input.tsx
│   │       └── animated-section.tsx     # Framer Motion wrapper
│   │
│   ├── lib/
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   ├── auth.ts                      # NextAuth exports
│   │   ├── auth.config.ts               # NextAuth configuration
│   │   ├── stripe.ts                    # Stripe client & helpers
│   │   ├── cloudinary.ts                # Cloudinary upload helpers
│   │   ├── resend.ts                    # Email sending helpers
│   │   ├── permissions.ts               # RBAC permission matrix
│   │   ├── utils.ts                     # cn() and utilities
│   │   ├── api-response.ts              # Standardized API responses
│   │   ├── pagination.ts                # Pagination helpers
│   │   ├── premium-calculator.ts        # Premium estimation engine
│   │   ├── pdf-generator.ts             # Policy/invoice PDF generation
│   │   └── validators.ts                # Shared validation helpers
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-permissions.ts
│   │   ├── use-form-autosave.ts
│   │   ├── use-premium-calculator.ts
│   │   └── use-debounce.ts
│   │
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── policy.ts
│   │   ├── claim.ts
│   │   ├── payment.ts
│   │   ├── product.ts
│   │   ├── contact.ts
│   │   └── cms.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── generated/
│   │   └── prisma/                      # Prisma generated client
│   │
│   └── middleware.ts                    # Auth middleware
│
├── .env.example
├── .gitignore
├── components.json                      # Shadcn UI config
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

## Route Groups Explained

| Group | Layout | Auth | Purpose |
|-------|--------|------|---------|
| `(public)` | Marketing header/footer | None | SEO-optimized public pages |
| `(auth)` | Centered card layout | None | Login, register, password reset |
| `(portal)` | Sidebar navigation | Customer | Policy management, claims |
| `(admin)` | Admin sidebar | Staff RBAC | CMS, operations, reports |

## Component Organization

Components are organized by **domain** (public, portal, admin) rather than by type, making it easy to find related UI for each area of the platform.

## API Route Convention

All API routes follow RESTful conventions:
- `GET` — Read/list resources
- `POST` — Create resources or trigger actions
- `PATCH` — Partial update
- `DELETE` — Remove resources

Nested routes use Next.js dynamic segments: `[id]`, `[slug]`.
