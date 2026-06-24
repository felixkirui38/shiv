# Shiv Insurance Platform

Enterprise-grade insurance platform for policy management, claims, payments, CMS, notifications, AI advisor, and customer portal.

Built with **Next.js 16**, **TypeScript**, **Prisma 7**, **PostgreSQL**, **NextAuth v5**, and multi-gateway payments (Stripe, Pesapal, Flutterwave, M-Pesa).

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Public website** | Products, blog, SEO, website builder, quote wizard |
| **Customer portal** | Policies, claims, payments, invoices, renewals |
| **Admin CMS** | RBAC, audit logs, exports, media, forms |
| **Payments** | Checkout, subscriptions, installments, webhooks |
| **Claims** | Submit, track, assign, timeline, notifications |
| **Notifications** | Email, SMS, WhatsApp, queued delivery |
| **AI advisor** | Product suggestions, premiums, claims help |
| **Production** | Docker, CI/CD, rate limiting, monitoring, backups |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js App Router, React 19, Tailwind v4, Shadcn UI |
| Backend | Next.js API Routes, Prisma ORM, PostgreSQL |
| Auth | NextAuth v5 with RBAC (8 roles) |
| Payments | Stripe, Pesapal, Flutterwave, M-Pesa |
| Media | Cloudinary |
| Email | Resend |
| AI | OpenAI (optional) |
| Deploy | Vercel, Docker, GitHub Actions |

---

## Quick Start

```bash
git clone <repo-url> shiv-insurance
cd shiv-insurance
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL and AUTH_SECRET

docker compose up -d postgres redis   # optional local DB
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (watch) |
| `npm run test:ci` | Vitest (CI mode) |
| `npm run db:migrate` | Dev migrations |
| `npm run db:migrate:deploy` | Production migrations |
| `npm run docker:up` | Start Postgres + Redis |
| `npm run docker:build` | Build Docker image |
| `npm run backup:db` | PostgreSQL backup |

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Installation](docs/INSTALLATION.md) | Full local setup |
| [Deployment](docs/DEPLOYMENT.md) | Vercel, Docker, VM |
| [Production](docs/PRODUCTION.md) | Security, monitoring, ops |
| [Architecture](docs/ARCHITECTURE.md) | System design |
| [API](docs/API.md) | REST API reference |

---

## Environment Variables

See [`.env.example`](.env.example) for development and [`.env.production.example`](.env.production.example) for production.

**Required minimum:**

- `DATABASE_URL` — PostgreSQL
- `AUTH_SECRET` — 32+ char secret (`openssl rand -base64 32`)
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` — App URL

---

## Production Checklist

- [ ] Set all secrets in hosting provider (never commit `.env`)
- [ ] Run `npm run db:migrate:deploy` before first deploy
- [ ] Configure `UPSTASH_REDIS_REST_*` for distributed rate limiting
- [ ] Set `CRON_SECRET` and enable Vercel cron (`vercel.json`)
- [ ] Configure Stripe/webhook URLs for production domain
- [ ] Enable automated backups (`scripts/backup-db.sh`)
- [ ] Optional: `SENTRY_DSN` + `npm install @sentry/nextjs`
- [ ] Verify `/api/health` returns `healthy`

---

## CI/CD

GitHub Actions workflows:

- **`.github/workflows/ci.yml`** — lint, build, test, Docker build on `main`
- **`.github/workflows/deploy.yml`** — migrate → Vercel deploy → optional backup

Required GitHub secrets for deploy: `DATABASE_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

## License

Private — All rights reserved.
