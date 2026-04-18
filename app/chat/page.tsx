import ChatShell from "@/components/ChatShell";

export default function ChatPage() {
  return (
    <section className="space-y-4">
      <div className="card p-5 text-sm leading-relaxed text-slate-700">
        <p>이 대화는 상담을 대신하지 않습니다.</p>
        <p>이 AI는 진단하거나 판단하지 않습니다.</p>
        <p>당신이 편하게 자신의 상태를 정리할 수 있도록 돕기 위한 사전 대화입니다.</p>
        <p>원하지 않는 내용은 공유하지 않을 수 있습니다.</p>
      </div>
      <ChatShell />
    </section>
  );
}
