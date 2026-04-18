import { NextRequest, NextResponse } from "next/server";
import { generateStructuredSummary } from "@/lib/ai";
import { endSession, getSessionBundle, getOrCreateActiveSession, upsertSummary } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const session = getOrCreateActiveSession();
  endSession(session.id, Boolean(body.endedEarly));

  const bundle = getSessionBundle(session.id);
  const summary = await generateStructuredSummary({
    sessionId: session.id,
    messages: bundle.messages,
    metrics: bundle.responseMetrics
  });
  upsertSummary(summary);

  return NextResponse.json({ sessionId: session.id, summary });
}
