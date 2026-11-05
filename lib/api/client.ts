/** Browser-side helpers for the app's own API routes. */

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiClientError("Network error — check your connection and retry.", 0, "network");
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const e = (body as { error?: { message?: string; code?: string; fields?: Record<string, string> } })?.error;
    throw new ApiClientError(e?.message ?? `Request failed (${res.status})`, res.status, e?.code, e?.fields);
  }
  return body as T;
}
