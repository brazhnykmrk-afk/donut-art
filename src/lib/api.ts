import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ServiceError } from "@/lib/errors";

export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

/**
 * Central error translation for API route handlers: ServiceError and Zod
 * validation errors become structured 4xx responses, everything else is a
 * generic 500 (details are logged, never leaked to the client).
 */
export function handleApiError(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof ServiceError) {
    return jsonError(error.code, error.message, error.status);
  }
  if (error instanceof ZodError) {
    const first = error.errors[0];
    return jsonError(
      "VALIDATION_ERROR",
      first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
      422,
    );
  }
  console.error("[api] unexpected error:", error);
  return jsonError("INTERNAL_ERROR", "Something went wrong.", 500);
}
