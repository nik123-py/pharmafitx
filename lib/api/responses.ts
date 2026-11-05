import "server-only";
import { NextResponse } from "next/server";
import { DrugsetuError, drugsetuErrorMessages } from "@/services/drugsetu/client";

const STATUS: Record<string, number> = {
  not_configured: 503,
  unauthorized: 502,
  rate_limited: 429,
  timeout: 504,
  not_found: 404,
  bad_request: 400,
  upstream: 502,
  malformed: 502,
};

export function catalogueErrorResponse(err: unknown) {
  if (err instanceof DrugsetuError) {
    if (err.code !== "not_found") console.error("[api] drugsetu error", err.code, err.message);
    return NextResponse.json(
      { error: { code: err.code, message: drugsetuErrorMessages[err.code] } },
      { status: STATUS[err.code] ?? 502, headers: err.code === "rate_limited" ? { "Retry-After": "2" } : undefined },
    );
  }
  console.error("[api] unexpected error", err);
  return NextResponse.json(
    { error: { code: "internal", message: "Something went wrong. Please retry." } },
    { status: 500 },
  );
}

export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: { code: "rate_limited", message: "Too many requests. Please slow down and retry shortly." } },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
