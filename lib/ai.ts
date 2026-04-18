import OpenAI from "openai";
import { guidedQuestions } from "./questions";
import { Message, ResponseMetric, StructuredSummary } from "./types";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function generateNextQuestion(params: { index: number; messages: Message[] }) {
  const fallback = guidedQuestions[params.index];
  if (!fallback) {
    return { text: "오늘 나눠준 이야기 고마워요. 여기서 마무리할까요?", usedFallback: true };
  }

  if (!client) return { text: fallback.text, usedFallback: true };

  try {
    const recent = params.messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a gentle pre-consultation conversation helper. Ask exactly one short Korean question. No diagnosis, no risk scoring, no personality labeling, no treatment advice. Keep tone non-judgmental and natural."
        },
        {
          role: "user",
          content: `다음 주제 질문을 자연스럽게 한 문장으로 만들어줘: ${fallback.text}\n최근 대화:\n${recent}`
        }
      ],
      max_output_tokens: 120
    });

    const text = completion.output_text?.trim();
    if (!text) return { text: fallback.text, usedFallback: true };
    return { text, usedFallback: false };
  } catch {
    return { text: fallback.text, usedFallback: true };
  }
}

export async function generateStructuredSummary(params: {
  sessionId: string;
  messages: Message[];
  metrics: ResponseMetric[];
}): Promise<StructuredSummary> {
  const fallbackSummary: StructuredSummary = {
    sessionId: params.sessionId,
    emotionState: collectByTopic(params.messages, "emotion"),
    repeatedStressors: collectByTopic(params.messages, "stressors"),
    sleepExpressions: collectByTopic(params.messages, "sleep"),
    rhythmExpressions: collectByTopic(params.messages, "meals"),
    relationshipExpressions: collectByTopic(params.messages, "relationships"),
    familyExpressions: collectByTopic(params.messages, "family"),
    workSchoolExpressions: collectByTopic(params.messages, "work_school"),
    userKeyPhrases: extractKeyPhrases(params.messages),
    lessDiscussedTopics: inferLessDiscussed(params.messages),
    observableNotes: metricNotes(params.metrics),
    suggestedExplorations: [
      "가족 이야기를 조금 더 편하게 풀어볼 수 있도록 최근 집에서의 분위기를 물어볼 수 있음",
      "수면 이야기가 반복되어 잠들기 전 어떤 생각이 드는지 추가로 확인할 수 있음"
    ]
  };

  if (!client) return fallbackSummary;

  try {
    const conversation = params.messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "assistant" ? "AI" : "사용자"}(${m.topic ?? "-"}): ${m.content}`)
      .join("\n");
    const metrics = JSON.stringify(params.metrics);

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "한국어 JSON만 출력. 진단/해석/위험도/성향 판단 금지. 관찰 가능한 표현과 패턴만 요약."
        },
        {
          role: "user",
          content: `아래 스키마 키를 모두 포함한 JSON 객체로 요약해줘.\nkeys: emotionState,repeatedStressors,sleepExpressions,rhythmExpressions,relationshipExpressions,familyExpressions,workSchoolExpressions,userKeyPhrases,lessDiscussedTopics,observableNotes,suggestedExplorations\n대화:\n${conversation}\n메트릭:${metrics}`
        }
      ],
      max_output_tokens: 900
    });

    const raw = response.output_text?.trim();
    if (!raw) return fallbackSummary;
    const parsed = JSON.parse(raw) as Omit<StructuredSummary, "sessionId">;
    return { sessionId: params.sessionId, ...parsed };
  } catch {
    return fallbackSummary;
  }
}

function collectByTopic(messages: Message[], topic: string) {
  return messages
    .filter((m) => m.role === "user" && m.topic === topic)
    .map((m) => m.content)
    .slice(0, 3);
}

function extractKeyPhrases(messages: Message[]) {
  return messages
    .filter((m) => m.role === "user")
    .flatMap((m) => m.content.split(/[,.!?\n]/).map((t) => t.trim()))
    .filter((t) => t.length >= 7)
    .slice(0, 6);
}

function inferLessDiscussed(messages: Message[]) {
  const map = new Map<string, number>();
  for (const q of guidedQuestions) {
    map.set(q.topic, messages.filter((m) => m.role === "user" && m.topic === q.topic).join(" ").length);
  }
  return [...map.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([k]) => k);
}

function metricNotes(metrics: ResponseMetric[]) {
  const notes: string[] = [];
  const delayed = metrics.filter((m) => (m.responseStartDelayMs ?? 0) > 10000);
  delayed.forEach((m) => notes.push(`${m.questionId} 질문에서 응답 시작 지연이 길었음`));
  const long = metrics.filter((m) => m.charCount > 120);
  long.forEach((m) => notes.push(`${m.questionId} 질문에 대한 응답이 비교적 길었음`));
  const skipped = metrics.filter((m) => m.skip);
  skipped.forEach((m) => notes.push(`${m.questionId} 질문 1회 건너뜀`));
  return notes.slice(0, 8);
}
