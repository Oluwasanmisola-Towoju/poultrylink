import { NextResponse } from "next/server";
import { authedExpressFetch, getAccessToken } from "@/lib/api/server";
import type { User } from "@/types";

export async function GET() {
  if (!getAccessToken()) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const result = await authedExpressFetch<{ user: User }>("/auth/me");

  if (!result.success) {
    return NextResponse.json(result, { status: 401 });
  }

  return NextResponse.json({ success: true, message: result.message, data: result.data.user });
}