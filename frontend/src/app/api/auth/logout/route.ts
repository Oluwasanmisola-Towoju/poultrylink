import { NextResponse } from "next/server";
import { expressFetch, getRefreshToken, getAccessToken, clearAuthCookies } from "@/lib/api/server";

export async function POST() {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (refreshToken) {
    // Best-effort — the user is logged out locally regardless of whether
    // this call succeeds, so a dead Express instance can't strand them.
    await expressFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      accessToken,
    }).catch(() => null);
  }

  clearAuthCookies();
  return NextResponse.json({ success: true, message: "Logged out", data: null });
}