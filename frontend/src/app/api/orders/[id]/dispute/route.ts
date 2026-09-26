import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { EscrowTransaction } from "@/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await authedExpressFetch<{ escrow: EscrowTransaction }>(`/orders/${params.id}/dispute`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.escrow });
}