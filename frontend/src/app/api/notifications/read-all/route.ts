import { NextResponse } from "next/server";
import { authedExpressFetch } from "@/lib/api/server";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const result = await authedExpressFetch(`/notifications/${params.id}/read`, { method: "PATCH" });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}