import { NextRequest, NextResponse } from "next/server";
import { getSessionBundle } from "@/lib/store";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const bundle = getSessionBundle(params.id);
  return NextResponse.json(bundle);
}
