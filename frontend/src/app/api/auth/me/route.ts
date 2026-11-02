import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { User } from "@/types";

export async function GET() {
  const result = await authedExpressFetch<{ user: User }>("/auth/me");

  if (!result.success) {
    return NextResponse.json(result, { status: 401 });
  }

  return NextResponse.json({ success: true, message: result.message, data: result.data.user });
}