import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Consultation Support MVP",
  description: "AI-assisted pre-consultation conversation support prototype"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
            <Link href="/" className="font-semibold text-calm-700">
              사전 상담 대화 지원 MVP
            </Link>
            <div className="flex gap-3 text-slate-600">
              <Link href="/chat" className="hover:text-calm-700">사용자 화면</Link>
              <Link href="/expert" className="hover:text-calm-700">전문가 화면</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto min-h-[calc(100vh-56px)] max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
