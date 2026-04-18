"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { guidedQuestions } from "@/lib/questions";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

export default function ChatShell() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "편하게 시작해볼게요. 요즘 하루를 지내면서 가장 자주 올라오는 감정은 어떤 느낌에 가깝나요?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [inputStartedAt, setInputStartedAt] = useState<string>();
  const [editCount, setEditCount] = useState(0);

  const progressLabel = useMemo(() => `${Math.min(questionIndex + 1, guidedQuestions.length)} / ${guidedQuestions.length}`, [questionIndex]);

  const submit = async (skip = false) => {
    if (!skip && !input.trim()) return;
    setIsSending(true);
    const now = new Date().toISOString();
    const userText = skip ? "건너뛸게요." : input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionIndex,
        userInput: userText,
        inputStartedAt,
        submittedAt: now,
        skip,
        editCount
      })
    }).then((r) => r.json());

    if (res.done) {
      const endRes = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endedEarly: false })
      }).then((r) => r.json());
      router.push(`/preview?sessionId=${endRes.sessionId}`);
      return;
    }

    setMessages((prev) => [...prev, { role: "assistant", content: res.assistantText }]);
    setQuestionIndex(res.nextQuestionIndex);
    setInput("");
    setInputStartedAt(undefined);
    setEditCount(0);
    setIsSending(false);
  };

  const endSession = async () => {
    const endRes = await fetch("/api/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endedEarly: true })
    }).then((r) => r.json());
    router.push(`/preview?sessionId=${endRes.sessionId}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>현재 질문 진행: {progressLabel}</span>
        <span>원치 않는 질문은 언제든 건너뛸 수 있어요.</span>
      </div>
      <div className="card h-[60vh] overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "assistant" ? "bg-calm-50 text-slate-700" : "ml-auto bg-calm-700 text-white"}`}>
              {m.content}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 card p-3">
        <textarea
          value={input}
          onChange={(e) => {
            if (!inputStartedAt) setInputStartedAt(new Date().toISOString());
            setEditCount((c) => c + 1);
            setInput(e.target.value);
          }}
          rows={4}
          placeholder="편한 표현으로 길게 적어도 괜찮아요."
          className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-calm-500"
        />
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button onClick={() => submit(true)} disabled={isSending} className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">건너뛰기</button>
          <button onClick={endSession} disabled={isSending} className="rounded-xl border border-rose-300 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50">종료하기</button>
          <button onClick={() => submit(false)} disabled={isSending} className="rounded-xl bg-calm-700 px-4 py-2 text-sm text-white hover:bg-calm-500 disabled:opacity-60">보내기</button>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">주의: 이 서비스는 실제 의료·진단 서비스를 대체하지 않습니다.</p>
    </div>
  );
}
