"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.message, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 font-sans">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-center text-slate-600">
          We have been notified. Please try again or contact support if the problem persists.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
