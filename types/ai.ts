import { ChatMessage } from "./index";

/**
 * Inputs for building the Tutor System Prompt.
 */
export interface TutorSystemPromptInput {
  problemDescription: string;
  referenceSolution: string | null;
  hints: string[] | null;
  hintLevel: number;
  starterCode: string;
}

/**
 * Inputs for building the Assessment System Prompt.
 */
export interface AssessmentSystemPromptInput extends TutorSystemPromptInput {
  is_correct: boolean;
  reasoning: string;
  mistakes: string[];
}

/**
 * Inputs for building the Tutor User Message.
 */
export interface TutorUserMessageInput {
  message?: string | null;
  code: string;
  error: string | null;
}

/**
 * Inputs for building the Brainstorm System Prompt.
 */
export interface BrainstormSystemPromptInput {
  problemDescription: string;
  starterCode: string;
}

/**
 * Inputs for building the Brainstorm User Message.
 */
export interface BrainstormUserMessageInput {
  message?: string | null;
}

/**
 * Inputs for building the Verify Solution Prompt.
 */
export interface VerifySolutionInput {
  code: string;
  problemDescription: string;
  referenceSolution: string | null;
  starterCode: string;
}

/**
 * The structured output format for solution verification.
 */
export interface VerifySolutionOutput {
  reasoning: string;
  is_correct: boolean;
  mistakes: string[];
}

/**
 * Inputs for the askBrainstorm LLM function.
 */
export interface AskBrainstormParams {
  message: string;
  history: ChatMessage[];
  problemDescription: string;
  starterCode: string;
}

/**
 * Inputs for the askHelp LLM function.
 */
export interface AskHelpParams {
  code: string;
  error: string;
  hintLevel: number;
  history: ChatMessage[];
  brainstormHistory: ChatMessage[];
  problemDescription: string;
  referenceSolution: string | null;
  hints: string[] | null;
  starterCode: string;
  message?: string | null;
}

/**
 * Inputs for the askAssessment LLM function.
 */
export interface AskAssessmentParams extends AskHelpParams {
  verificationResult: VerifySolutionOutput;
}

/**
 * Inputs for the generateSolution LLM function.
 */
export interface GenerateSolutionParams {
  problemDescription: string;
  language: string;
  systemPrompt: string;
}
