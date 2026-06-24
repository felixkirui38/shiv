# Production database migrations (idempotent)
$ErrorActionPreference = "Stop"

Write-Host "==> Shiv Insurance — Prisma migrate deploy"

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL is required"
}

npx prisma generate
npx prisma migrate deploy

Write-Host "==> Migrations applied successfully"
