export type Status = "new" | "learning" | "developing" | "secure";
export interface Skill {
  id: string;
  name: string;
  theme: string;
  level: number;
  prerequisites: string[];
}
export interface Mastery {
  score: number;
  securedAt: string | null;
  attempts: number;
  correct: number;
  recent: boolean[];
  sessions: string[];
  lastPractised: string | null;
  difficulty: number;
  status: Status;
}
export interface Attempt {
  skill: string;
  correct: boolean;
  date: string;
  session: string;
  difficulty: number;
}
export interface Session {
  id: string;
  date: string;
  count: number;
  correct: number;
}
export interface Feedback {
  template: string;
  rating: "Easy" | "About right" | "Tricky";
  date: string;
}
export interface State {
  version: 1;
  nickname: string;
  avatar: string;
  theme: {
    id: string;
    name: string;
    start: string;
    end: string;
    skills: string[];
  };
  mastery: Record<string, Mastery>;
  attempts: Attempt[];
  sessions: Session[];
  feedback: Feedback[];
  settings: { sound: boolean };
}
export interface Question {
  skill: string;
  difficulty: number;
  prompt: string;
  answer: number | number[];
  options?: number[];
  visual?: { tens: number; ones: number };
  explanation: string;
}
