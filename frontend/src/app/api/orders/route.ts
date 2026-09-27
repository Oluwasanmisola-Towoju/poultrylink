import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Order } from "@/types";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await authedExpressFetch<{ order: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json({ success: true, message: result.message, data: result.data.order }, { status: 201 });
}