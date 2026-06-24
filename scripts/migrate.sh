#!/usr/bin/env sh
# Production database migrations (idempotent)
set -euo pipefail

echo "==> Shiv Insurance — Prisma migrate deploy"
echo "    DATABASE_URL: ${DATABASE_URL:+[set]}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is required"
  exit 1
fi

npx prisma generate
npx prisma migrate deploy

echo "==> Migrations applied successfully"
