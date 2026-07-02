export function isDbConnectionError(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 4) return false;

  const e = error as { code?: string; message?: string; cause?: unknown };
  const message = e.message ?? "";

  if (
    e.code === "P1001" ||
    e.code === "P1008" ||
    e.code === "P1017" ||
    e.code === "ECONNREFUSED" ||
    e.code === "ECONNRESET" ||
    message.includes("closed the connection") ||
    message.includes("Connection terminated") ||
    message.includes("ECONNRESET") ||
    message.includes("read ECONNRESET") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection refused") ||
    message.includes("Cannot use a pool after calling end") ||
    message.includes("after calling end on the pool") ||
    message.includes("timeout exceeded when trying to connect")
  ) {
    return true;
  }

  if (e.cause) {
    return isDbConnectionError(e.cause, depth + 1);
  }

  return false;
}

export function toUserFacingDbError(fallback: string): string {
  return fallback;
}

export function sanitizeApiErrorMessage(
  message: string | undefined,
  fallback: string
): string {
  if (!message) return fallback;
  if (isDbConnectionError({ message })) {
    return "Service is temporarily unavailable. Please try again in a moment.";
  }
  if (
    message.includes("prisma") ||
    message.includes("pool") ||
    message.includes("Invalid `")
  ) {
    return fallback;
  }
  return message;
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
      const { resetPrisma, getPrisma, getLastPrismaResetAt } = await import("@/lib/prisma");
      console.warn(
        `[prisma] Database connection lost — reconnecting (attempt ${attempt + 2}/${maxAttempts})…`
      );
      const recentlyReset = Date.now() - getLastPrismaResetAt() < 2_000;
      if (!recentlyReset) {
        await resetPrisma();
      } else {
        getPrisma();
      }
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }

  throw lastError;
}
