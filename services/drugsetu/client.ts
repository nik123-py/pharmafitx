import "server-only";
import type { z } from "zod";
import { integrations } from "@/config/integrations";

export type DrugsetuErrorCode =
  | "not_configured"
  | "unauthorized"
  | "rate_limited"
  | "timeout"
  | "not_found"
  | "bad_request"
  | "upstream"
  | "malformed";

export class DrugsetuError extends Error {
  constructor(
    public code: DrugsetuErrorCode,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "DrugsetuError";
  }
}

/** Public, user-safe messages (never leak upstream internals to the browser). */
export const drugsetuErrorMessages: Record<DrugsetuErrorCode, string> = {
  not_configured: "The product catalogue is not configured yet. Please try again later.",
  unauthorized: "The product catalogue is temporarily unavailable (authentication).",
  rate_limited: "The catalogue is receiving many requests. Please retry in a moment.",
  timeout: "The catalogue took too long to respond. Please retry.",
  not_found: "We couldn't find that product in the catalogue.",
  bad_request: "That search couldn't be processed. Try different keywords.",
  upstream: "The product catalogue is temporarily unavailable. Please retry shortly.",
  malformed: "The catalogue returned an unexpected response. Please retry shortly.",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Serialises upstream requests per server instance. DrugSetu's plan allows about
 * one request per second, so bursts (e.g. a page rendering several sections) are
 * queued instead of fanning out into 429s.
 */
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

type Query = Record<string, string | number | undefined | null>;

interface RequestOptions<T> {
  path: string;
  query?: Query;
  schema: z.ZodType<T>;
  /** Next.js data-cache revalidation in seconds. */
  revalidate?: number;
  retries?: number;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(integrations.drugsetu.baseUrl + path);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function drugsetuRequest<T>({
  path,
  query,
  schema,
  revalidate = integrations.drugsetu.revalidate,
  retries = 3,
}: RequestOptions<T>): Promise<T> {
  const { apiKey, timeoutMs } = integrations.drugsetu;
  if (!apiKey) throw new DrugsetuError("not_configured", "DRUGSETU_API_KEY is not set");

  const url = buildUrl(path, query);

  for (let attempt = 0; ; attempt++) {
    const res = await enqueue(async () => {
      try {
        return await fetch(url, {
          headers: { "X-API-Key": apiKey, Accept: "application/json" },
          signal: AbortSignal.timeout(timeoutMs),
          next: { revalidate },
        });
      } catch (err) {
        const name = (err as Error)?.name;
        if (name === "TimeoutError" || name === "AbortError") {
          throw new DrugsetuError("timeout", `DrugSetu timed out: ${path}`);
        }
        throw new DrugsetuError("upstream", `DrugSetu network error: ${(err as Error)?.message}`);
      }
    }).catch((e: unknown) => e as DrugsetuError);

    if (res instanceof DrugsetuError) {
      if (attempt < retries && res.code !== "not_configured") {
        await sleep(600 * (attempt + 1));
        continue;
      }
      throw res;
    }

    if (res.status === 429 || res.status >= 500) {
      if (attempt < retries) {
        let wait = 1100 * (attempt + 1);
        try {
          const body = (await res.clone().json()) as { retryAfter?: number };
          if (typeof body.retryAfter === "number") wait = Math.max(wait, body.retryAfter * 1000 + 150);
        } catch {
          /* ignore */
        }
        await sleep(Math.min(wait, 5000));
        continue;
      }
      throw new DrugsetuError(
        res.status === 429 ? "rate_limited" : "upstream",
        `DrugSetu ${res.status} for ${path}`,
        res.status,
      );
    }

    if (res.status === 401 || res.status === 403) {
      throw new DrugsetuError("unauthorized", `DrugSetu rejected the API key (${res.status})`, res.status);
    }
    if (res.status === 404) throw new DrugsetuError("not_found", `Not found: ${path}`, 404);
    if (res.status === 400) {
      let detail = "";
      try {
        detail = JSON.stringify(((await res.json()) as { message?: unknown }).message);
      } catch {
        /* ignore */
      }
      throw new DrugsetuError("bad_request", `DrugSetu 400 for ${path} ${detail}`, 400);
    }
    if (!res.ok) throw new DrugsetuError("upstream", `DrugSetu ${res.status} for ${path}`, res.status);

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      throw new DrugsetuError("malformed", `DrugSetu returned non-JSON for ${path}`);
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error("[drugsetu] schema mismatch", path, parsed.error.issues.slice(0, 5));
      throw new DrugsetuError("malformed", `DrugSetu response for ${path} did not match the expected schema`);
    }
    return parsed.data;
  }
}
