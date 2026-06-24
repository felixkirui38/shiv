import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let dbOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? "healthy" : "degraded";
  const httpStatus = dbOk ? 200 : 503;

  return apiSuccess(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbOk ? "up" : "down",
      },
      latencyMs: Date.now() - started,
      version: process.env.npm_package_version ?? "0.1.0",
    },
    httpStatus
  );
}
