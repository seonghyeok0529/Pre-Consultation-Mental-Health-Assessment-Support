import { NextRequest, NextResponse } from "next/server";
import { getSessionBundle, upsertSharePreference } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  upsertSharePreference({
    sessionId: body.sessionId,
    mode: body.mode,
    selectedTopics: body.selectedTopics
  });
  const bundle = getSessionBundle(body.sessionId);
  return NextResponse.json({ ok: true, sharePreference: bundle.sharePreference });
}
