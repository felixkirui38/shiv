# PostgreSQL backup script — Windows / PowerShell
param(
  [string]$OutputDir = ".\backups"
)

$ErrorActionPreference = "Stop"

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL is required"
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "shiv_insurance_${timestamp}.sql"
$outPath = Join-Path $OutputDir $filename

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "==> Backing up to $outPath"
pg_dump $env:DATABASE_URL --no-owner --no-acl -f $outPath

# Compress
Compress-Archive -Path $outPath -DestinationPath "$outPath.gz" -Force
Remove-Item $outPath

# Retain 14 days
Get-ChildItem $OutputDir -Filter "shiv_insurance_*.gz" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
  Remove-Item -Force

Write-Host "==> Backup complete"
