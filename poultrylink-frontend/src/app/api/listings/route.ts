import { NextResponse } from "next/server";
import { expressFetch, authedExpressFetch } from "@/lib/api/server";
import type { Listing } from "@/types";

// Public search — no auth needed.
export async function GET(req: Request) {
  const { search } = new URL(req.url);
  const result = await expressFetch(`/listings/search${search}`);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

// Create a listing — FARMER only, enforced by Express regardless of what this forwards.
export async function POST(req: Request) {
  const body = await req.json();
  const result = await authedExpressFetch<{ listing: Listing }>("/listings", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!result.success) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result.data.listing }, { status: 201 });
}