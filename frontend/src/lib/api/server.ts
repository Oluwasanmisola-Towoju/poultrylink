import "server-only";
import { cookies } from "next/headers";
import {
  EXPRESS_API_URL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "./config";
import type { ApiResponse } from "@/types";

async function rawExpressFetch<T>(
  path: string,
  init: RequestInit & { accessToken?: string } = {}
): Promise<{ status: number; body: ApiResponse<T> }> {
  const { accessToken, headers, ...rest } = init;

  const res = await fetch(`${EXPRESS_API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const body = (await res.json()) as ApiResponse<T>;
  return { status: res.status, body };
}

/** Calls Express directly. Only ever used from route handlers / server components. */
export async function expressFetch<T>(
  path: string,
  init: RequestInit & { accessToken?: string } = {}
): Promise<ApiResponse<T>> {
  const { body } = await rawExpressFetch<T>(path, init);
  return body;
}

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOpts(ACCESS_TOKEN_MAX_AGE));
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOpts(REFRESH_TOKEN_MAX_AGE));
}

export function clearAuthCookies() {
  const store = cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export function getAccessToken(): string | undefined {
  return cookies().get(ACCESS_TOKEN_COOKIE)?.value;
}

export function getRefreshToken(): string | undefined {
  return cookies().get(REFRESH_TOKEN_COOKIE)?.value;
}

export function issueSession<U>(data: { accessToken: string; refreshToken: string; user: U }) {
  setAuthCookies(data.accessToken, data.refreshToken);
  return { user: data.user };
}

/**
 * Calls Express with the current access token; on a real 401 (not just any
 * error) it tries one silent refresh and retries once. Checks the actual
 * HTTP status rather than sniffing the error message text.
 */
export async function authedExpressFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  let accessToken = getAccessToken();
  const { status, body: initialBody } = await rawExpressFetch<T>(path, { ...init, accessToken });
  let body = initialBody;

  if (status !== 401 || !accessToken) return body;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return body;

  const refreshed = await expressFetch<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh-token",
    { method: "POST", body: JSON.stringify({ refreshToken }) }
  );

  if (!refreshed.success) {
    clearAuthCookies();
    return body;
  }

  setAuthCookies(refreshed.data.accessToken, refreshed.data.refreshToken);
  accessToken = refreshed.data.accessToken;
  ({ body } = await rawExpressFetch<T>(path, { ...init, accessToken }));
  return body;
}