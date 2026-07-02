import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { resolvePgConnectionString } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

let resetPromise: Promise<PrismaClient> | null = null;
let lastResetFinishedAt = 0;

export function getLastPrismaResetAt(): number {
  return lastResetFinishedAt;
}

function createPool(): Pool {
  const pool = new Pool({
    connectionString: resolvePgConnectionString(),
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
    allowExitOnIdle: false,
  });
  pool.on("error", (err) => {
    console.error("[prisma] PostgreSQL pool error:", err.message);
  });
  return pool;
}

function createPrismaClient(pool: Pool): PrismaClient {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function installClient(pool: Pool): PrismaClient {
  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = createPrismaClient(pool);
  return globalForPrisma.prisma;
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma || !globalForPrisma.pgPool) {
    return installClient(createPool());
  }
  return globalForPrisma.prisma;
}

async function disposeClient(
  client: PrismaClient | undefined,
  pool: Pool | undefined
): Promise<void> {
  if (client) {
    await client.$disconnect().catch(() => undefined);
  }
  if (pool) {
    await pool.end().catch(() => undefined);
  }
}

export async function resetPrisma(): Promise<PrismaClient> {
  if (resetPromise) return resetPromise;

  resetPromise = (async () => {
    const oldClient = globalForPrisma.prisma;
    const oldPool = globalForPrisma.pgPool;

    const client = installClient(createPool());

    // Let in-flight queries on the old pool finish before closing it.
    setTimeout(() => {
      void disposeClient(oldClient, oldPool);
    }, 2_000);

    lastResetFinishedAt = Date.now();
    return client;
  })().finally(() => {
    resetPromise = null;
  });

  return resetPromise;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

if (process.env.NODE_ENV !== "production") {
  getPrisma();
}

export default prisma;
