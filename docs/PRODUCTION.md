# Production Operations Guide

Enterprise operations reference for security, performance, reliability, and compliance.

---

## Security

### Security headers

Configured in `next.config.ts` and `vercel.json`:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | 2-year HSTS (production) |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Restricts camera, mic, geolocation |
| `X-Powered-By` | Removed |

### Authentication & RBAC

- NextAuth session encryption via `AUTH_SECRET`
- Admin/portal routes guarded by middleware
- 8 roles with granular permissions (`src/lib/permissions.ts`)
- Audit logging for admin mutations

### Rate limiting

Implementation: `src/lib/security/rate-limit.ts`

| Endpoint class | Limit | Window |
|----------------|-------|--------|
| Auth | 10 req | 60s |
| Contact form | 5 req | 300s |
| AI chat | 20 req | 60s |
| General API | 100 req | 60s |

**Single instance:** In-memory sliding window (automatic fallback).

**Production / serverless:** Configure Upstash Redis:

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Create a free database at [upstash.com](https://upstash.com).

### Webhook security

All payment webhooks verify provider signatures:

- Stripe: `STRIPE_WEBHOOK_SECRET`
- Flutterwave: `FLUTTERWAVE_WEBHOOK_SECRET`
- Pesapal / M-Pesa: Provider-specific validation in route handlers

### Secrets management

- Never commit `.env` files
- Use Vercel Environment Variables or AWS Secrets Manager
- Rotate `AUTH_SECRET`, `CRON_SECRET`, and API keys quarterly
- Separate staging and production credentials

---

## Logging

Structured JSON logs via `src/lib/logger/index.ts`:

```json
{
  "timestamp": "2026-06-23T10:00:00.000Z",
  "level": "info",
  "message": "http_request",
  "service": "shiv-insurance",
  "method": "POST",
  "path": "/api/contact",
  "status": 201,
  "durationMs": 45
}
```

**Production:** Pipe stdout to your log aggregator (Datadog, CloudWatch, Axiom, Better Stack).

Prisma logs errors only in production (`src/lib/prisma.ts`).

---

## Error Monitoring

### Sentry (optional)

1. Install: `npm install @sentry/nextjs`
2. Configure:

```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

3. Instrumentation auto-loads via `src/instrumentation.ts`
4. Global errors captured in `src/app/global-error.tsx`

Without Sentry, errors are logged as structured JSON.

---

## Caching

### Next.js data cache

`src/lib/cache/index.ts` wraps `unstable_cache` with tags:

| Tag | Content |
|-----|---------|
| `products` | Insurance catalog |
| `navigation` | Site nav |
| `homepage` | CMS homepage |
| `seo` | Meta settings |
| `blog` | Blog posts |

Invalidate on admin CMS updates by calling `revalidateTag()` in mutation handlers.

### CDN / static assets

- `/_next/static/*` — 1 year immutable (Vercel headers)
- Cloudinary images — use transforms + `f_auto,q_auto`

### Redis (optional)

`REDIS_URL` for session cache or custom caching in Docker deployments.

---

## Performance

### Build optimizations (`next.config.ts`)

- `output: "standalone"` — minimal Docker images
- `compress: true` — gzip responses
- `optimizePackageImports` — tree-shake lucide-react, date-fns, framer-motion
- AVIF/WebP image formats
- Font `display: swap` (Inter, Poppins)

### Recommendations

| Area | Action |
|------|--------|
| Database | Connection pooling (PgBouncer, Neon pooler) |
| Images | Cloudinary CDN, responsive sizes |
| API | Paginate list endpoints, index frequently queried columns |
| Cron | Off-peak scheduling for notification batch jobs |
| Lighthouse | Target 90+ on homepage (test after deploy) |

---

## Backups

### Manual backup

```bash
# Linux / macOS
./scripts/backup-db.sh ./backups

# Windows
.\scripts\backup-db.ps1
```

Requires `pg_dump` in PATH.

### Automated backup

- **Cron:** Daily at 02:00 UTC (see Deployment Guide)
- **GitHub Actions:** Post-deploy backup in `deploy.yml`
- **Managed DB:** Enable Neon/Supabase/RDS automated backups

### Retention

Scripts retain 14 days locally. Store long-term backups in S3/GCS with encryption.

### Recovery drill

Test restore quarterly on a staging database.

---

## Health Checks

```
GET /api/health
```

| Status | HTTP | Meaning |
|--------|------|---------|
| `healthy` | 200 | Database reachable |
| `degraded` | 503 | Database down |

Use for load balancer, Kubernetes liveness, and uptime monitors.

---

## Testing

```bash
npm run test        # Watch mode
npm run test:ci     # CI (single run)
npm run test:coverage
```

Tests live in `tests/unit/`. CI runs on every push/PR.

### Recommended additions

- E2E: Playwright for quote wizard and portal flows
- Integration: API route tests with test database
- Load: k6 on `/api/health` and `/api/products`

---

## Accessibility

### Implemented

- Skip-to-content link (`src/app/layout.tsx`)
- `lang="en"` on `<html>`
- Semantic `<main id="main-content">`
- Focus-visible styles on interactive elements (Tailwind)

### Standards

Target **WCAG 2.1 AA**:

- Color contrast ≥ 4.5:1 for body text
- All form inputs have associated labels
- Images have alt text (enforce in CMS)
- Keyboard navigation for modals and menus

### Audit tools

- axe DevTools browser extension
- Lighthouse accessibility audit
- `eslint-plugin-jsx-a11y` (via `eslint-config-next`)

---

## CI/CD Pipeline

```
Push/PR → lint → build → test → audit
Main    → migrate → Vercel deploy → backup
```

See `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`.

---

## Compliance Notes

| Area | Guidance |
|------|----------|
| **PII** | Encrypt at rest (Postgres), TLS in transit |
| **Payments** | PCI DSS via Stripe hosted checkout |
| **Kenya DPA** | Data processing agreements with Resend, Cloudinary, OpenAI |
| **Audit** | Admin actions logged in `audit_logs` table |
| **Retention** | Define policy for claims, quotes, AI conversations |

---

## Incident Response

1. Check `/api/health` and hosting provider status
2. Review structured logs / Sentry for errors
3. Roll back deployment if application regression
4. Restore database from backup if data issue
5. Rotate compromised secrets immediately
6. Document incident in post-mortem

---

## Environment Reference

| Variable | Production required |
|----------|---------------------|
| `DATABASE_URL` | Yes |
| `AUTH_SECRET` | Yes |
| `AUTH_URL` | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes |
| `CRON_SECRET` | Yes (if using cron) |
| `UPSTASH_REDIS_REST_*` | Recommended |
| `SENTRY_DSN` | Recommended |
| `OPENAI_API_KEY` | If AI advisor enabled |

Full list: `.env.production.example`
