import { randomUUID } from "crypto";
import { guidedQuestions } from "./questions";
import { Message, QuestionEvent, ResponseMetric, Session, SharePreference, StructuredSummary, TopicKey } from "./types";

interface Store {
  sessions: Session[];
  messages: Message[];
  questionEvents: QuestionEvent[];
  responseMetrics: ResponseMetric[];
  summaries: StructuredSummary[];
  sharePreferences: SharePreference[];
}

const globalKey = "__pcmh_store__";
const globalStore = globalThis as unknown as { [globalKey]?: Store };

function initialStore(): Store {
  return { sessions: [], messages: [], questionEvents: [], responseMetrics: [], summaries: [], sharePreferences: [] };
}

export const db = globalStore[globalKey] ?? initialStore();
if (!globalStore[globalKey]) globalStore[globalKey] = db;

export function startSession(): Session {
  const session: Session = { id: randomUUID(), startedAt: new Date().toISOString(), status: "active", endedEarly: false };
  db.sessions.push(session);
  return session;
}

export function getOrCreateActiveSession(): Session {
  const active = db.sessions.find((s) => s.status === "active");
  if (active) return active;
  const created = startSession();
  const first = guidedQuestions[0];
  pushAssistantQuestion(created.id, first.id, first.topic, first.text);
  return created;
}

export function pushAssistantQuestion(sessionId: string, questionId: string, topic: TopicKey, content: string) {
  db.messages.push({ id: randomUUID(), sessionId, role: "assistant", content, questionId, topic, createdAt: new Date().toISOString() });
  db.questionEvents.push({
    sessionId,
    questionId,
    topic,
    questionText: content,
    displayedAt: new Date().toISOString(),
    skip: false,
    editCount: 0
  });
}

export function addUserMessage(params: {
  sessionId: string;
  questionId: string;
  topic: TopicKey;
  content: string;
  inputStartedAt?: string;
  submittedAt?: string;
  skip: boolean;
  editCount: number;
}) {
  const submittedAt = params.submittedAt ?? new Date().toISOString();
  const questionEvent = db.questionEvents.find((q) => q.sessionId === params.sessionId && q.questionId === params.questionId);

  if (questionEvent) {
    questionEvent.inputStartedAt = params.inputStartedAt;
    questionEvent.submittedAt = submittedAt;
    questionEvent.skip = params.skip;
    questionEvent.editCount = params.editCount;
  }

  db.messages.push({
    id: randomUUID(),
    sessionId: params.sessionId,
    role: "user",
    content: params.content,
    questionId: params.questionId,
    topic: params.topic,
    createdAt: submittedAt
  });

  const displayed = questionEvent ? new Date(questionEvent.displayedAt).getTime() : Date.now();
  const inputStarted = params.inputStartedAt ? new Date(params.inputStartedAt).getTime() : undefined;
  const submitted = new Date(submittedAt).getTime();

  db.responseMetrics.push({
    sessionId: params.sessionId,
    questionId: params.questionId,
    responseStartDelayMs: inputStarted ? Math.max(inputStarted - displayed, 0) : undefined,
    totalResponseTimeMs: inputStarted ? Math.max(submitted - inputStarted, 0) : undefined,
    charCount: params.content.length,
    skip: params.skip
  });
}

export function getSessionBundle(sessionId: string) {
  return {
    session: db.sessions.find((s) => s.id === sessionId),
    messages: db.messages.filter((m) => m.sessionId === sessionId),
    questionEvents: db.questionEvents.filter((e) => e.sessionId === sessionId),
    responseMetrics: db.responseMetrics.filter((r) => r.sessionId === sessionId),
    summary: db.summaries.find((s) => s.sessionId === sessionId),
    sharePreference: db.sharePreferences.find((p) => p.sessionId === sessionId)
  };
}

export function endSession(sessionId: string, endedEarly: boolean) {
  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.status = "ended";
  session.endedAt = new Date().toISOString();
  session.endedEarly = endedEarly;
}

export function upsertSummary(summary: StructuredSummary) {
  const idx = db.summaries.findIndex((s) => s.sessionId === summary.sessionId);
  if (idx >= 0) db.summaries[idx] = summary;
  else db.summaries.push(summary);
}

export function upsertSharePreference(pref: SharePreference) {
  const idx = db.sharePreferences.findIndex((s) => s.sessionId === pref.sessionId);
  if (idx >= 0) db.sharePreferences[idx] = pref;
  else db.sharePreferences.push(pref);
}
