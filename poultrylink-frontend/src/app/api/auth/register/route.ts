import { NextResponse } from "next/server";
import { expressFetch } from "@/lib/api/server";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await expressFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return NextResponse.json(result, { status: result.success ? 201 : 400 });
}