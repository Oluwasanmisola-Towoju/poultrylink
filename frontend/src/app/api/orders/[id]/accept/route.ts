import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Order } from "@/types";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const result = await authedExpressFetch<{ order: Order }>(`/orders/${params.id}/accept`, { method: "POST" });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.order });
}