"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopicKey } from "@/lib/types";

const topicOptions: { key: TopicKey; label: string }[] = [
  { key: "emotion", label: "최근 감정 상태" },
  { key: "stressors", label: "반복된 스트레스 요인" },
  { key: "sleep", label: "수면 관련 표현" },
  { key: "meals", label: "식사/생활 리듬" },
  { key: "relationships", label: "대인관계" },
  { key: "family", label: "가족" },
  { key: "work_school", label: "학업/진로/업무" }
];

export default function PreviewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("sessionId") || "";
  const [bundle, setBundle] = useState<any>();
  const [mode, setMode] = useState<"all" | "pattern_only" | "none">("all");
  const [selectedTopics, setSelectedTopics] = useState<TopicKey[]>(topicOptions.map((t) => t.key));

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session/${sessionId}`).then((r) => r.json()).then(setBundle);
  }, [sessionId]);

  const submitShare = async () => {
    await fetch("/api/session/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, mode, selectedTopics })
    });
    router.push(`/expert?sessionId=${sessionId}`);
  };

  if (!bundle?.summary) return <div className="card p-5">요약을 불러오는 중...</div>;

  const s = bundle.summary;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-calm-700">전문가에게 공유할 내용 미리보기</h1>
      <div className="card p-5 text-sm">
        <h2 className="font-medium">주제별 구조화 요약(관찰 기반)</h2>
        <ul className="mt-3 space-y-2 list-disc pl-5">
          <li>최근 감정 상태: {s.emotionState.join(" / ") || "기록 없음"}</li>
          <li>반복 언급된 스트레스 요인: {s.repeatedStressors.join(" / ") || "기록 없음"}</li>
          <li>수면 관련 표현: {s.sleepExpressions.join(" / ") || "기록 없음"}</li>
          <li>식사/생활 리듬: {s.rhythmExpressions.join(" / ") || "기록 없음"}</li>
          <li>대인관계: {s.relationshipExpressions.join(" / ") || "기록 없음"}</li>
          <li>가족: {s.familyExpressions.join(" / ") || "기록 없음"}</li>
          <li>학업/진로/업무: {s.workSchoolExpressions.join(" / ") || "기록 없음"}</li>
          <li>사용자 핵심 표현: {s.userKeyPhrases.join(" / ") || "기록 없음"}</li>
          <li>충분히 이야기되지 않은 주제: {s.lessDiscussedTopics.join(" / ") || "기록 없음"}</li>
        </ul>
        <h3 className="mt-4 font-medium">반응 패턴 관찰</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {s.observableNotes.map((n: string) => (<li key={n}>{n}</li>))}
        </ul>
      </div>

      <div className="card p-5 text-sm space-y-3">
        <h2 className="font-medium">공유 옵션 선택</h2>
        <label className="flex gap-2"><input type="radio" name="mode" checked={mode === "all"} onChange={() => setMode("all")} /> 전체 요약 공유</label>
        <label className="flex gap-2"><input type="radio" name="mode" checked={mode === "pattern_only"} onChange={() => setMode("pattern_only")} /> 반응 패턴만 공유</label>
        <label className="flex gap-2"><input type="radio" name="mode" checked={mode === "none"} onChange={() => setMode("none")} /> 공유하지 않음</label>

        <div>
          <p className="mb-2">주제별 공유 선택(선택):</p>
          <div className="grid grid-cols-2 gap-2">
            {topicOptions.map((t) => (
              <label key={t.key} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(t.key)}
                  onChange={(e) => {
                    setSelectedTopics((prev) =>
                      e.target.checked ? [...new Set([...prev, t.key])] : prev.filter((k) => k !== t.key)
                    );
                  }}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>
        <button onClick={submitShare} className="rounded-xl bg-calm-700 px-4 py-2 text-white">선택 저장 후 전문가 화면으로</button>
      </div>
    </section>
  );
}
