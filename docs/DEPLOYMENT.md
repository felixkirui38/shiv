# Deployment Guide

Deploy Shiv Insurance to Vercel, Docker, or a Linux VM with PostgreSQL.

---

## Deployment Options

| Platform | Best for | Database |
|----------|----------|----------|
| **Vercel** | Serverless, fast CI/CD | Neon, Supabase, RDS |
| **Docker** | Self-hosted, full control | Compose or managed |
| **VM / VPS** | Enterprise on-prem | Managed or local Postgres |

---

## Pre-deploy Checklist

1. Production database provisioned with SSL
2. All secrets from `.env.production.example` configured
3. Domain DNS pointed to hosting provider
4. Payment webhook URLs updated to production domain
5. `CRON_SECRET` set for scheduled notifications
6. Email domain verified in Resend

---

## Option 1 — Vercel (Recommended)

### 1. Connect repository

```bash
npm i -g vercel
vercel login
vercel link
```

Or connect via [Vercel Dashboard](https://vercel.com) → Import Git Repository.

### 2. Configure environment variables

In Vercel Project → Settings → Environment Variables, add all values from `.env.production.example`.

**Critical:**

```
DATABASE_URL
AUTH_SECRET
AUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
CRON_SECRET
STRIPE_WEBHOOK_SECRET
```

### 3. Database migrations

Run before or after first deploy:

```bash
# Local with production DATABASE_URL
export DATABASE_URL="postgresql://..."
npm run db:migrate:deploy
```

Or use GitHub Actions deploy workflow (`.github/workflows/deploy.yml`).

### 4. Deploy

```bash
vercel --prod
```

`vercel.json` configures:

- Daily cron for notification reminders (`/api/cron/notifications`)
- Security headers
- Static asset caching

### 5. Post-deploy

| Task | Action |
|------|--------|
| Health check | `curl https://your-domain.com/api/health` |
| Stripe webhooks | Point to `https://your-domain.com/api/webhooks/stripe` |
| Cron | Verify Vercel Cron in dashboard |
| SSL | Automatic via Vercel |

### Vercel + Neon (example)

1. Create Neon project → copy pooled connection string
2. Set `DATABASE_URL` in Vercel
3. Enable `?sslmode=require` in connection string
4. Run `prisma migrate deploy`

---

## Option 2 — Docker

### Build & run

```bash
# Build
docker build -t shiv-insurance:latest .

# Start infrastructure
docker compose up -d postgres redis

# Migrate
export DATABASE_URL="postgresql://shiv:shiv_dev_password@localhost:5432/shiv_insurance"
bash scripts/migrate.sh

# Run app
docker run -d \
  --name shiv-app \
  -p 3000:3000 \
  --env-file .env.production \
  --network host \
  shiv-insurance:latest
```

### Docker Compose (full stack)

```bash
# Set AUTH_SECRET and other vars in .env
docker compose --profile full up -d
```

### Production overlay

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile full up -d
```

Place behind **nginx** or **Caddy** with TLS termination.

#### Sample nginx snippet

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.com;

  ssl_certificate     /etc/ssl/fullchain.pem;
  ssl_certificate_key /etc/ssl/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## Option 3 — Linux VM

### 1. Server setup

```bash
# Ubuntu 22.04+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs postgresql-client nginx
```

### 2. Deploy application

```bash
git clone <repo> /opt/shiv-insurance
cd /opt/shiv-insurance
npm ci
cp .env.production.example .env
# Edit .env

npm run db:migrate:deploy
npm run build
```

### 3. Process manager (PM2)

```bash
npm install -g pm2
pm2 start npm --name shiv -- start
pm2 save
pm2 startup
```

### 4. Automated backups

```cron
# crontab -e
0 2 * * * cd /opt/shiv-insurance && DATABASE_URL="..." ./scripts/backup-db.sh /var/backups/shiv
```

---

## GitHub Actions CI/CD

### CI (every push/PR)

`.github/workflows/ci.yml`:

- ESLint
- Prisma generate + db push + build
- Vitest unit tests
- npm audit
- Docker build on `main`

### CD (main branch)

`.github/workflows/deploy.yml`:

1. `prisma migrate deploy`
2. Vercel production deploy
3. Optional DB backup artifact

**Required secrets:**

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Production Postgres |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel team ID |
| `VERCEL_PROJECT_ID` | Project ID |

---

## Database Migrations

### Development

```bash
npm run db:migrate
# Creates migration in prisma/migrations/
```

### Production (always)

```bash
bash scripts/migrate.sh
# or
npm run db:migrate:deploy
```

**Never** run `db:push` or `migrate dev` in production.

---

## Rollback

### Application

- **Vercel:** Redeploy previous deployment from dashboard
- **Docker:** `docker run` previous image tag
- **PM2:** Redeploy previous git tag

### Database

Restore from backup:

```bash
gunzip -c backups/shiv_insurance_YYYYMMDD.sql.gz | psql "$DATABASE_URL"
```

---

## Monitoring

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Load balancer health check |
| Vercel Analytics | Traffic & Web Vitals |
| Sentry (`SENTRY_DSN`) | Error tracking |

---

## Support

See [Production Guide](PRODUCTION.md) for security headers, rate limiting, caching, and accessibility standards.
