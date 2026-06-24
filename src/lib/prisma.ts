import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { resolvePgConnectionString } from "@/lib/database-url";
import { withDbRetry } from "@/lib/db-retry";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

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

function createPrismaClient(): PrismaClient {
  if (globalForPrisma.pgPool) {
    globalForPrisma.pgPool.end().catch(() => undefined);
  }
  globalForPrisma.pgPool = createPool();
  const adapter = new PrismaPg(globalForPrisma.pgPool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export async function resetPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }
  if (globalForPrisma.pgPool) {
    await globalForPrisma.pgPool.end().catch(() => undefined);
    globalForPrisma.pgPool = undefined;
  }
  globalForPrisma.prisma = createPrismaClient();
  return globalForPrisma.prisma;
}

function wrapClientWithRetry<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop) {
      const value = Reflect.get(obj, prop, obj) as unknown;
      if (typeof value === "function") {
        const fn = value as (...args: unknown[]) => unknown;
        if (prop === "$disconnect" || prop === "$connect") {
          return fn.bind(obj);
        }
        return (...args: unknown[]) => withDbRetry(() => fn.apply(obj, args));
      }
      if (value && typeof value === "object") {
        return wrapClientWithRetry(value as object);
      }
      return value;
    },
  }) as T;
}

export const prisma = wrapClientWithRetry(getPrisma());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = getPrisma();
}

export default prisma;
