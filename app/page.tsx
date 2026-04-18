import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="card p-6 md:p-8">
        <h1 className="text-2xl font-bold text-calm-700">시작 안내</h1>
        <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-700">
          {`이 대화는 상담을 대신하지 않습니다.
이 AI는 진단하거나 판단하지 않습니다.
당신이 편하게 자신의 상태를 정리할 수 있도록 돕기 위한 사전 대화입니다.
원하지 않는 내용은 공유하지 않을 수 있습니다.`}
        </p>
        <div className="mt-6 rounded-xl bg-calm-50 p-4 text-sm text-slate-700">
          목적: 대면 상담 전에 사용자가 자신의 경험을 더 자연스럽게 정리하고,
          전문가가 참고할 수 있도록 대화를 관찰 가능한 형태로 구조화합니다.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/chat" className="rounded-xl bg-calm-700 px-5 py-3 text-white hover:bg-calm-500">
            대화 시작하기
          </Link>
          <Link href="/expert" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-700 hover:bg-slate-50">
            전문가 요약 보기(데모)
          </Link>
        </div>
      </div>
      <p className="text-xs text-slate-500">본 MVP는 의료 서비스가 아니며, 진단/위험도 판정을 제공하지 않습니다.</p>
    </section>
  );
}
