import { NextResponse } from "next/server";
import { expressFetch, authedExpressFetch } from "@/lib/api/server";
import type { Listing } from "@/types";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const result = await expressFetch<{ listing: Listing }>(`/listings/${params.id}`);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.listing });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await authedExpressFetch<{ listing: Listing }>(`/listings/${params.id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.listing });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const result = await authedExpressFetch(`/listings/${params.id}`, { method: "DELETE" });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}