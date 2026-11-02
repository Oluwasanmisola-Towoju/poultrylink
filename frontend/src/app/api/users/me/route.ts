import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Profile } from "@/types";

export async function PATCH(req: Request) {
  const body = await req.json();
  const result = await authedExpressFetch<{ profile: Profile }>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.profile });
}