import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Farm } from "@/types";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await authedExpressFetch<{ farm: Farm }>("/farms", { method: "POST", body: JSON.stringify(body) });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.farm }, { status: 201 });
}