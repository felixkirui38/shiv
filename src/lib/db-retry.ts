export function isDbConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  const message = e.message ?? "";
  return (
    e.code === "P1001" ||
    e.code === "P1008" ||
    e.code === "P1017" ||
    e.code === "ECONNREFUSED" ||
    message.includes("closed the connection") ||
    message.includes("Connection terminated") ||
    message.includes("ECONNRESET") ||
    message.includes("read ECONNRESET") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection refused") ||
    message.includes("Cannot use a pool after calling end") ||
    message.includes("after calling end on the pool")
  );
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isDbConnectionError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      const { resetPrisma } = await import("@/lib/prisma");
      console.warn(
        `[prisma] Database connection lost — reconnecting (attempt ${attempt + 2}/${maxAttempts})…`
      );
      await resetPrisma();
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError;
}
