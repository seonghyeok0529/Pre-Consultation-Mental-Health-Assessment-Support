export type TopicKey =
  | "emotion"
  | "stressors"
  | "sleep"
  | "meals"
  | "daily_function"
  | "relationships"
  | "family"
  | "work_school"
  | "stress_event";

export interface Session {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: "active" | "ended";
  endedEarly: boolean;
}

export interface Message {
  id: string;
  sessionId: string;
  role: "assistant" | "user" | "system";
  content: string;
  questionId?: string;
  topic?: TopicKey;
  createdAt: string;
}

export interface QuestionEvent {
  sessionId: string;
  questionId: string;
  topic: TopicKey;
  questionText: string;
  displayedAt: string;
  inputStartedAt?: string;
  submittedAt?: string;
  skip: boolean;
  editCount: number;
}

export interface ResponseMetric {
  sessionId: string;
  questionId: string;
  responseStartDelayMs?: number;
  totalResponseTimeMs?: number;
  charCount: number;
  skip: boolean;
}

export interface StructuredSummary {
  sessionId: string;
  emotionState: string[];
  repeatedStressors: string[];
  sleepExpressions: string[];
  rhythmExpressions: string[];
  relationshipExpressions: string[];
  familyExpressions: string[];
  workSchoolExpressions: string[];
  userKeyPhrases: string[];
  lessDiscussedTopics: string[];
  observableNotes: string[];
  suggestedExplorations: string[];
}

export interface SharePreference {
  sessionId: string;
  mode: "all" | "pattern_only" | "none";
  selectedTopics?: TopicKey[];
}
