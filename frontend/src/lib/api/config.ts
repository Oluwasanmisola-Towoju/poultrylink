// Only imported by server-side code (route handlers, server components).
// Never exposed to the browser — that's the whole point of the BFF proxy.
export const EXPRESS_API_URL = process.env.EXPRESS_API_URL ?? "http://localhost:5000/api/v1";

export const ACCESS_TOKEN_COOKIE = "pl_access_token";
export const REFRESH_TOKEN_COOKIE = "pl_refresh_token";

// Keep these a little under the backend's actual JWT expiry so the cookie
// never outlives the token it's holding.
export const ACCESS_TOKEN_MAX_AGE = 14 * 60; // 14 min (access tokens expire at 15)
export const REFRESH_TOKEN_MAX_AGE = 29 * 24 * 60 * 60; // 29 days (refresh expires at 30)