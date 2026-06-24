import { logger } from "@/lib/logger";

let sentryInitialized = false;

async function loadSentry(): Promise<{
  init: (opts: Record<string, unknown>) => void;
  captureException: (error: unknown, opts?: Record<string, unknown>) => void;
} | null> {
  if (!process.env.SENTRY_DSN) return null;

  try {
    // Optional peer dependency — install with: npm install @sentry/nextjs
    const moduleName = "@sentry/nextjs";
    const Sentry = await import(/* webpackIgnore: true */ moduleName);
    return Sentry as {
      init: (opts: Record<string, unknown>) => void;
      captureException: (error: unknown, opts?: Record<string, unknown>) => void;
    };
  } catch {
    return null;
  }
}

export async function initMonitoring() {
  if (sentryInitialized || !process.env.SENTRY_DSN) return;

  const Sentry = await loadSentry();
  if (!Sentry) {
    logger.warn("SENTRY_DSN set but @sentry/nextjs is not installed");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    enabled: process.env.NODE_ENV === "production",
  });
  sentryInitialized = true;
  logger.info("Sentry monitoring initialized");
}

export async function captureException(
  error: unknown,
  context?: Record<string, unknown>
) {
  logger.error("unhandled_exception", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  if (!process.env.SENTRY_DSN) return;

  const Sentry = await loadSentry();
  if (Sentry) {
    Sentry.captureException(error, { extra: context });
  }
}
