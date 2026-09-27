import { NextResponse } from "next/server";
import { expressFetch, issueSession } from "@/lib/api/server";
import type { User } from "@/types";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await expressFetch<{ accessToken: string; refreshToken: string; user: User }>(
    "/auth/verify-otp",
    { method: "POST", body: JSON.stringify(body) }
  );

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(
    { success: true, message: result.message, data: issueSession(result.data) },
    { status: 200 }
  );
}