import { TopicKey } from "./types";

export interface GuidedQuestion {
  id: string;
  topic: TopicKey;
  text: string;
}

export const guidedQuestions: GuidedQuestion[] = [
  { id: "q1", topic: "emotion", text: "요즘 하루를 지내면서 가장 자주 올라오는 감정은 어떤 느낌에 가깝나요?" },
  { id: "q2", topic: "stressors", text: "최근에 유난히 버겁게 느껴졌던 상황이 있었다면 편한 만큼만 들려주세요." },
  { id: "q3", topic: "sleep", text: "잠드는 시간이나 자는 동안의 느낌은 요즘 어떤 편인가요?" },
  { id: "q4", topic: "meals", text: "식사나 생활 리듬(기상/활동 시간 등)은 최근 어떻게 흘러가고 있나요?" },
  { id: "q5", topic: "daily_function", text: "해야 할 일을 시작하거나 마무리하는 데 체감되는 어려움이 있다면 어떤가요?" },
  { id: "q6", topic: "relationships", text: "사람들과의 연락이나 만남에서 편해진 점/불편해진 점이 있을까요?" },
  { id: "q7", topic: "family", text: "가족과 관련해 요즘 마음에 남는 장면이나 분위기가 있나요?" },
  { id: "q8", topic: "work_school", text: "학업·진로·업무 중에서 현재 가장 부담되는 부분은 무엇인가요?" },
  { id: "q9", topic: "stress_event", text: "최근 스트레스를 크게 느꼈던 사건이 있었다면, 기억나는 범위에서 적어주세요." }
];
