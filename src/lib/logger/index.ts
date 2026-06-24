type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function serialize(level: LogLevel, message: string, context?: LogContext) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    service: "shiv-insurance",
    env: process.env.NODE_ENV ?? "development",
  ...context,
  });
}

function write(level: LogLevel, message: string, context?: LogContext) {
  const line = serialize(level, message, context);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "debug" && process.env.NODE_ENV !== "production") {
    console.debug(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};

export function logRequest(
  method: string,
  path: string,
  status: number,
  durationMs: number,
  extra?: LogContext
) {
  logger.info("http_request", {
    method,
    path,
    status,
    durationMs,
    ...extra,
  });
}
