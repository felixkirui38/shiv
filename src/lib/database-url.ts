/**
 * Prisma CLI accepts `prisma+postgres://` URLs from `prisma dev`.
 * Runtime `@prisma/adapter-pg` needs a direct `postgresql://` connection string.
 */
export function resolvePgConnectionString(): string {
  const direct = process.env.DIRECT_DATABASE_URL?.trim();
  if (direct) return normalizePgUrl(direct);

  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url.startsWith("prisma+postgres://")) return normalizePgUrl(url);

  try {
    const parsed = new URL(url);
    const apiKey = parsed.searchParams.get("api_key");
    if (!apiKey) return normalizePgUrl(url);

    const json = JSON.parse(Buffer.from(apiKey, "base64").toString("utf8")) as {
      databaseUrl?: string;
    };
    if (json.databaseUrl) return normalizePgUrl(json.databaseUrl);
  } catch {
    // fall through
  }

  return normalizePgUrl(url);
}

function normalizePgUrl(raw: string): string {
  const normalized = raw.startsWith("postgres://")
    ? raw.replace("postgres://", "postgresql://")
    : raw;

  try {
    const parsed = new URL(normalized);
    parsed.searchParams.delete("max_idle_connection_lifetime");
    parsed.searchParams.delete("connection_limit");
    parsed.searchParams.set("connect_timeout", "15");
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "disable");
    }
    return parsed.toString();
  } catch {
    return normalized;
  }
}
