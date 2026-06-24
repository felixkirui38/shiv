#!/usr/bin/env sh
# PostgreSQL backup script — run via cron or CI
# Usage: ./scripts/backup-db.sh [output_dir]
set -euo pipefail

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="shiv_insurance_${TIMESTAMP}.sql.gz"
mkdir -p "$OUTPUT_DIR"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is required"
  exit 1
fi

echo "==> Backing up to ${OUTPUT_DIR}/${FILENAME}"
pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "${OUTPUT_DIR}/${FILENAME}"

# Retain last 14 daily backups
find "$OUTPUT_DIR" -name "shiv_insurance_*.sql.gz" -mtime +14 -delete 2>/dev/null || true

echo "==> Backup complete: ${FILENAME}"
ls -lh "${OUTPUT_DIR}/${FILENAME}"
