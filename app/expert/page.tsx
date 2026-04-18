"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function fmtMs(ms?: number) {
  if (!ms) return "-";
  return `${Math.round(ms / 1000)}초`;
}

export default function ExpertPage() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId") || "";
  const [bundle, setBundle] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session/${sessionId}`).then((r) => r.json()).then(setBundle);
  }, [sessionId]);

  const cards = useMemo(() => {
    if (!bundle?.responseMetrics) return { delayed: [], short: [], long: [], skipped: [] };
    const metrics = bundle.responseMetrics;
    return {
      delayed: metrics.filter((m: any) => (m.responseStartDelayMs ?? 0) > 10000),
      short: metrics.filter((m: any) => m.charCount > 0 && m.charCount < 15),
      long: metrics.filter((m: any) => m.charCount > 120),
      skipped: metrics.filter((m: any) => m.skip)
    };
  }, [bundle]);

  if (!sessionId) {
    return <div className="card p-5">세션 ID가 없습니다. 예시: /expert?sessionId=...</div>;
  }
  if (!bundle?.summary) return <div className="card p-5">데이터 로딩 중...</div>;

  const { session, summary, sharePreference } = bundle;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-calm-700">전문가 요약 화면</h1>
      <div className="card p-5 text-sm space-y-1">
        <p>세션 ID: {session?.id}</p>
        <p>시작: {session?.startedAt}</p>
        <p>종료: {session?.endedAt}</p>
        <p>중도 종료 여부: {session?.endedEarly ? "예" : "아니오"}</p>
        <p>사용자 공유 옵션: {sharePreference?.mode ?? "미선택"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 text-sm">
          <h2 className="font-medium">주제별 요약</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>최근 감정 상태: {summary.emotionState.join(" / ") || "-"}</li>
            <li>반복 스트레스 요인: {summary.repeatedStressors.join(" / ") || "-"}</li>
            <li>수면 관련: {summary.sleepExpressions.join(" / ") || "-"}</li>
            <li>식사/생활 리듬: {summary.rhythmExpressions.join(" / ") || "-"}</li>
            <li>대인관계: {summary.relationshipExpressions.join(" / ") || "-"}</li>
            <li>가족: {summary.familyExpressions.join(" / ") || "-"}</li>
            <li>학업/진로/업무: {summary.workSchoolExpressions.join(" / ") || "-"}</li>
          </ul>
        </div>
        <div className="card p-5 text-sm">
          <h2 className="font-medium">사용자 핵심 표현(원문 기반)</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {summary.userKeyPhrases.map((p: string) => <li key={p}>{p}</li>)}
          </ul>
          <h3 className="mt-4 font-medium">추가 탐색 질문(비진단형)</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {summary.suggestedExplorations.map((q: string) => <li key={q}>{q}</li>)}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="card p-4">
          <h3 className="font-medium">응답 시작 지연</h3>
          <ul className="mt-2 space-y-1">
            {cards.delayed.map((m: any) => <li key={m.questionId}>{m.questionId}: {fmtMs(m.responseStartDelayMs)}</li>)}
          </ul>
        </div>
        <div className="card p-4">
          <h3 className="font-medium">짧게 답한 질문</h3>
          <ul className="mt-2 space-y-1">{cards.short.map((m: any) => <li key={m.questionId}>{m.questionId} ({m.charCount}자)</li>)}</ul>
        </div>
        <div className="card p-4">
          <h3 className="font-medium">길게 답한 질문</h3>
          <ul className="mt-2 space-y-1">{cards.long.map((m: any) => <li key={m.questionId}>{m.questionId} ({m.charCount}자)</li>)}</ul>
        </div>
        <div className="card p-4">
          <h3 className="font-medium">건너뛴 질문</h3>
          <ul className="mt-2 space-y-1">{cards.skipped.map((m: any) => <li key={m.questionId}>{m.questionId}</li>)}</ul>
        </div>
      </div>

      <p className="text-xs text-slate-500">이 화면은 관찰 가능한 표현 및 반응 패턴만 제시하며, 진단/위험도 판정을 제공하지 않습니다.</p>
    </section>
  );
}
