import { NextRequest, NextResponse } from "next/server";
import { generateNextQuestion } from "@/lib/ai";
import { guidedQuestions } from "@/lib/questions";
import { addUserMessage, getOrCreateActiveSession, getSessionBundle, pushAssistantQuestion } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const session = getOrCreateActiveSession();
  const question = guidedQuestions[body.questionIndex];

  if (!question) {
    return NextResponse.json({ done: true, sessionId: session.id });
  }

  addUserMessage({
    sessionId: session.id,
    questionId: question.id,
    topic: question.topic,
    content: body.skip ? "(건너뜀)" : body.userInput,
    inputStartedAt: body.inputStartedAt,
    submittedAt: body.submittedAt,
    skip: Boolean(body.skip),
    editCount: Number(body.editCount ?? 0)
  });

  const nextIndex = body.questionIndex + 1;
  const next = guidedQuestions[nextIndex];
  if (!next) {
    return NextResponse.json({ done: true, sessionId: session.id });
  }

  const bundle = getSessionBundle(session.id);
  const generated = await generateNextQuestion({ index: nextIndex, messages: bundle.messages });

  pushAssistantQuestion(session.id, next.id, next.topic, generated.text);

  return NextResponse.json({
    done: false,
    sessionId: session.id,
    nextQuestionIndex: nextIndex,
    assistantText: generated.text,
    usedFallback: generated.usedFallback
  });
}
