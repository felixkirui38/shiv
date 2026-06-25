import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { resolvePgConnectionString } from "@/lib/database-url";
import { withDbRetry } from "@/lib/db-retry";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

let resetPromise: Promise<PrismaClient> | null = null;

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
  if (resetPromise) return resetPromise;

  resetPromise = (async () => {
    const oldClient = globalForPrisma.prisma;
    const oldPool = globalForPrisma.pgPool;

    globalForPrisma.prisma = undefined;
    globalForPrisma.pgPool = undefined;

    if (oldClient) {
      await oldClient.$disconnect().catch(() => undefined);
    }
    if (oldPool) {
      await oldPool.end().catch(() => undefined);
    }

    const client = createPrismaClient();
    globalForPrisma.prisma = client;
    return client;
  })().finally(() => {
    resetPromise = null;
  });

  return resetPromise;
}

function bindWithRetry<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: object
): T {
  return ((...args: unknown[]) =>
    withDbRetry(() => Promise.resolve(fn.apply(context, args)))) as T;
}

function createModelProxy(modelKey: string | symbol): object {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const client = getPrisma();
        const model = Reflect.get(client, modelKey, client) as object;
        const value = Reflect.get(model, prop, model);
        if (typeof value === "function") {
          return bindWithRetry(
            value as (...args: unknown[]) => unknown,
            model
          );
        }
        return value;
      },
    }
  );
}

function createPrismaProxy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      const client = getPrisma();
      const value = Reflect.get(client, prop, client) as unknown;

      if (typeof value === "function") {
        if (prop === "$disconnect" || prop === "$connect") {
          return (value as (...args: unknown[]) => unknown).bind(client);
        }
        return bindWithRetry(value as (...args: unknown[]) => unknown, client);
      }

      if (value && typeof value === "object") {
        return createModelProxy(prop);
      }

      return value;
    },
  }) as PrismaClient;
}

export const prisma = createPrismaProxy();

if (process.env.NODE_ENV !== "production") {
  getPrisma();
}

export default prisma;
