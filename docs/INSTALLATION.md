# Installation Guide

Complete setup for local development and staging environments.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ (22 recommended) |
| npm | 10+ |
| PostgreSQL | 15+ |
| Git | Latest |

**Optional:** Docker Desktop, Redis (or Upstash), Stripe CLI, pgAdmin

---

## 1. Clone & Install

```bash
git clone <repository-url> shiv-insurance
cd shiv-insurance
npm install
```

---

## 2. Environment Configuration

```bash
cp .env.example .env
```

### Minimum required variables

```env
DATABASE_URL="postgresql://shiv:shiv_dev_password@localhost:5432/shiv_insurance?schema=public"
AUTH_SECRET="your-32-char-minimum-secret-here"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Shiv Insurance"
```

Generate `AUTH_SECRET`:

```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Optional integrations

| Variable | Purpose |
|----------|---------|
| `STRIPE_*` | Card payments |
| `RESEND_API_KEY` | Transactional email |
| `CLOUDINARY_*` | Media uploads |
| `OPENAI_API_KEY` | AI Insurance Advisor |
| `UPSTASH_REDIS_REST_*` | Distributed rate limiting |

---

## 3. Database Setup

### Option A — Docker (recommended)

```bash
docker compose up -d postgres redis
```

Default credentials match `.env.example` when using docker-compose.

### Option B — Local PostgreSQL

```sql
CREATE DATABASE shiv_insurance;
CREATE USER shiv WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE shiv_insurance TO shiv;
```

Update `DATABASE_URL` in `.env`.

---

## 4. Run Migrations & Seed

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

For schema sync without migration history (dev only):

```bash
npm run db:push
```

Open Prisma Studio:

```bash
npm run db:studio
```

---

## 5. Start Development Server

```bash
npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Public website |
| http://localhost:3000/portal | Customer portal |
| http://localhost:3000/admin | Admin CMS |
| http://localhost:3000/api/health | Health check |

---

## 6. Create Admin User

After seeding, use the **development admin account**:

| Field | Value |
|-------|--------|
| Email | `admin@shivinsbro.co.ke` |
| Password | `Shivinsbro@2026` |
| Role | `SUPER_ADMIN` |

Re-run `npm run db:seed` anytime to reset this password in local dev.

**CMS access:** double-tap `Licensed Insurance Broker — IRA/06/267/2024` in the footer, or sign in at `/login`.

For production, create dedicated staff accounts and **do not** use these credentials.

---

## 7. Payment Webhooks (Local)

### Stripe

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

### M-Pesa / Pesapal / Flutterwave

Use [ngrok](https://ngrok.com) or similar to expose `localhost:3000` and configure callback URLs in each provider dashboard.

---

## 8. Verify Installation

```bash
npm run lint
npm run test:ci
npm run build
curl http://localhost:3000/api/health
```

Expected health response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": { "database": "up" }
  }
}
```

---

## 9. Docker Full Stack

Run the entire app in Docker:

```bash
# Build image
npm run docker:build

# Start DB + Redis
docker compose up -d postgres redis

# Run migrations (one-off)
docker compose --profile migrate up migrate

# Start app
docker compose --profile full up -d app
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `PrismaClientInitializationError` | Check `DATABASE_URL`, ensure Postgres is running |
| Auth redirect loops | Set `AUTH_URL` to match your exact origin |
| Build fails on DB queries | Expected without DB; ensure Postgres is up for full build |
| Rate limit in dev | In-memory limiter resets on server restart |
| AI advisor not showing | Enable in Admin → AI Advisor + set `OPENAI_API_KEY` |

---

## Next Steps

- [Deployment Guide](DEPLOYMENT.md) — production hosting
- [Production Guide](PRODUCTION.md) — security, monitoring, backups
