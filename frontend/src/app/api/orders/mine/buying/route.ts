import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";

export async function GET(req: Request) {
  const { search } = new URL(req.url);
  const result = await authedExpressFetch(`/orders/mine/buying${search}`);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}