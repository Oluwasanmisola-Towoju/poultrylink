import { NextResponse } from "next/server";
import { expressFetch, getRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/api/server";

export async function POST() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const result = await expressFetch<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh-token",
    { method: "POST", body: JSON.stringify({ refreshToken }) }
  );

  if (!result.success) {
    clearAuthCookies();
    return NextResponse.json(result, { status: 401 });
  }

  setAuthCookies(result.data.accessToken, result.data.refreshToken);
  return NextResponse.json({ success: true, message: "Session refreshed", data: null });
}