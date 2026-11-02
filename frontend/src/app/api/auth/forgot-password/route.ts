import { NextResponse } from "next/server";
import { expressFetch } from "@/lib/api/server";

// Public. Express always answers with the same generic message whether or not
// the email exists, so this never leaks which accounts are registered.
export async function POST(req: Request) {
  const body = await req.json();
  const result = await expressFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}