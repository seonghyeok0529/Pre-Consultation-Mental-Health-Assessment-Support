# Pre-Consultation Mental Health Assessment Support (Hackathon MVP)

정신건강 **대면 상담 전 사전 사정 지원**을 위한 웹 기반 MVP입니다.

> 본 프로젝트는 상담/치료를 대체하지 않으며,
> AI가 진단, 위험도 판정, 성향 단정을 하지 않도록 설계되어 있습니다.

## 1) 핵심 기능

- 시작 안내 페이지 (`/`)
- 도메인 하위 경로 랜딩 페이지 (`/mentalhealth`)
- 사용자 채팅 페이지 (`/chat`)
  - 질문 1개씩 제시
  - 건너뛰기 / 종료하기
  - 반응 패턴 기록(지연 시간, 응답 시간, 글자 수, skip, edit count 등)
- 세션 종료 후 공유 미리보기 페이지 (`/preview?sessionId=...`)
  - 전체 요약/반응 패턴만/공유 안 함
  - 주제별 체크박스 공유 선택
- 전문가 요약 페이지 (`/expert?sessionId=...`)
  - 세션 기본 정보
  - 주제별 요약
  - 사용자 핵심 표현
  - 반응 패턴 카드
  - 비진단형 추가 탐색 질문 제안

## 2) 기술 스택

- Frontend/API: Next.js (App Router) + React + TypeScript
- Styling: Tailwind CSS
- 저장: 인메모리 mock store (`lib/store.ts`)
- AI: OpenAI API 연동 구조 + 실패/키 없음 fallback

## 3) 실행 방법

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## 4) 환경변수

- `OPENAI_API_KEY`: 선택 사항
  - 있으면 질문 연결문/구조화 요약 생성에 모델 호출
  - 없거나 호출 실패 시 fallback 로직 사용

## 5) 주요 폴더 구조

```text
app/
  page.tsx                      # 시작 안내
  chat/page.tsx                 # 사용자 대화 화면
  preview/page.tsx              # 공유 미리보기 및 공유 설정
  expert/page.tsx               # 전문가 요약 화면
  api/chat/route.ts             # 사용자 응답 처리 + 다음 질문 생성
  api/session/end/route.ts      # 세션 종료 + 구조화 요약 생성
  api/session/share/route.ts    # 공유 설정 저장
  api/session/[id]/route.ts     # 세션 번들 조회
components/
  ChatShell.tsx                 # 채팅 UI/입력/건너뛰기/종료 제어
lib/
  ai.ts                         # OpenAI 연동 및 fallback
  questions.ts                  # 질문 시나리오
  store.ts                      # 인메모리 데이터 모델 저장
  types.ts                      # Session/Message/Metric/Summary 등 타입
```

## 6) 데이터 모델 (MVP)

- `Session`
- `Message`
- `QuestionEvent`
- `ResponseMetric`
- `StructuredSummary`
- `SharePreference`

모두 `lib/types.ts`에 정의되어 있으며 인메모리 저장소로 관리됩니다.

## 7) 추후 확장 포인트

1. 저장소 확장: SQLite/PostgreSQL + Prisma
2. 인증/권한: 사용자/전문가 계정 분리
3. 세션 목록 및 이력 관리
4. Structured summary 스키마 검증(Zod)
5. 프롬프트 버저닝/모니터링
6. 운영 환경에서 로깅/감사 추적 강화

## 8) 안전성 가드레일

- 진단/위험도 점수/성격 유형 판정 기능 미구현
- 요약은 관찰 가능한 표현 및 반응 패턴 중심
- UI 및 문구에 "의료 서비스 대체 아님" 명시

