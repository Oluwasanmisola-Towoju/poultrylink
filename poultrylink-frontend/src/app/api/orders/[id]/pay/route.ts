import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const result = await authedExpressFetch<{ authorizationUrl: string; reference: string }>(
    `/orders/${params.id}/pay`,
    { method: "POST" }
  );
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}