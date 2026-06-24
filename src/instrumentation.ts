export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initMonitoring } = await import("@/lib/monitoring");
    await initMonitoring();
  }
}

export const onRequestError = async (
  error: Error,
  request: { path: string; method: string },
  context: { routerKind: string }
) => {
  const { captureException } = await import("@/lib/monitoring");
  await captureException(error, {
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
  });
};
