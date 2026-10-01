import { NextResponse } from "next/server";
import { expressFetch } from "@/lib/api/server";

export async function GET() {
  const result = await expressFetch("/listings/categories");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}