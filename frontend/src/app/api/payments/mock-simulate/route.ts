import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";
import type { Payment } from "@/types";

// Dev/test only — the Express side also guards this with NODE_ENV !== 'production'.
export async function POST(req: Request) {
  const body = await req.json();
  const result = await authedExpressFetch<{ payment: Payment }>("/payments/mock/simulate", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.payment });
}