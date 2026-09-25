import type { ApiResponse, ApiSuccess } from "@/types";

export class ApiClientError extends Error {
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.details = details;
  }
}

async function rawApiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    credentials: "same-origin",
  });

  const body = (await res.json()) as ApiResponse<T>;
  if (!body.success) throw new ApiClientError(body.message, body.details);
  return body;
}

/**
 * Client components only ever talk to this app's own /api/* route handlers
 * (same-origin, cookies sent automatically). The Express API URL and the
 * JWTs themselves never reach the browser.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await rawApiFetch<T>(path, init);
  return data;
}

/** Same as apiFetch, but keeps the pagination meta for list endpoints. */
export async function apiFetchPaginated<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ data: T; meta?: ApiSuccess<T>["meta"] }> {
  const { data, meta } = await rawApiFetch<T>(path, init);
  return { data, meta };
}