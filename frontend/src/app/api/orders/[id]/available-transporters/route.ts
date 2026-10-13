import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const result = await authedExpressFetch<{ transporters: unknown[] }>(
    `/orders/${params.id}/available-transporters`
  );
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
