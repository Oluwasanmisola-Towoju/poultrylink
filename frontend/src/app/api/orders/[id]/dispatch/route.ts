import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Order } from "@/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const result = await authedExpressFetch<{ order: Order }>(`/orders/${params.id}/dispatch`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.order });
}