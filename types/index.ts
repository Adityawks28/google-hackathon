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
  referenceSolution: string | null;
  hints: string[] | null;
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
  code: string | null;
  error: string | null;
  hintLevel: number | null;
}

export interface UserSession {
  id?: string;
  userId: string;
  problemId: string;
  brainstormMessages: ChatMessage[];
  helpMessages: ChatMessage[];
  phase: TutorPhase;
  code?: string;
  language?: string;
  createdAt: number;
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
  sessionId: string;
  mode: "brainstorm" | "help";
  brainstormHistory?: ChatMessage[];
  userId: string;
}

export interface TutorResponse {
  guidance: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: number;
}
