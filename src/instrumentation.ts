// This file is used to configure Next.js instrumentation
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side Sentry configuration
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime Sentry configuration
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
