import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Payment } from "@/types";

export async function GET(_req: Request, { params }: { params: { reference: string } }) {
  const result = await authedExpressFetch<{ payment: Payment }>(`/payments/verify/${params.reference}`);
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.payment });
}