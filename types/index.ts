export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
  difficulty: "easy" | "medium" | "hard";
  language: string;
  createdBy: string;
  createdAt: number;
  referenceSolution?: string;
}

export interface UserProgress {
  id?: string;
  userId: string;
  problemId: string;
  attempted: boolean;
  solved: boolean;
  hintHistory: number[];
  lastAttemptAt: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  code?: string;
  error?: string;
  hintLevel?: number;
}

export interface UserSession {
  userId: string;
  problemId: string;
  brainstormMessages: ChatMessage[];
  helpMessages: ChatMessage[];
  phase: TutorPhase;
  updatedAt: number;
}

export type TutorPhase = "brainstorm" | "code" | "help";

export interface TutorRequest {
  code: string;
  error: string;
  hintLevel: number;
  message?: string;
  history: ChatMessage[];
  problemId: string;
  mode: "brainstorm" | "help";
  brainstormHistory?: ChatMessage[];
  userId: string;
}

export interface TutorResponse {
  guidance: string;
}

export interface EvaluateRequest {
  code: string;
  problemId: string;
}

export interface EvaluateResponse {
  correct: boolean;
  feedback: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: number;
}
