import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Review } from "@/types";

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  const body = await req.json();
  const result = await authedExpressFetch<{ review: Review }>(`/reviews/orders/${params.orderId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.review }, { status: 201 });
}