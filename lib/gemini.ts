import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage } from "@/types";
import {
  AskBrainstormParams,
  AskHelpParams,
  AskAssessmentParams,
  GenerateSolutionParams,
  VerifySolutionOutput,
  VerifySolutionInput,
} from "@/types/ai";
import {
  buildTutorSystemPrompt,
  buildTutorUserMessage,
  buildAssessmentSystemPrompt,
  buildBrainstormSystemPrompt,
  buildBrainstormUserMessage,
  buildVerifySolutionPrompt,
} from "@/lib/prompt-builder";

let _ai: GoogleGenAI | undefined;
function getAI(): GoogleGenAI {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });
  }
  return _ai;
}

/**
 * Maps our internal ChatMessage structure to the Gemini SDK's Content format.
 */
function mapToGeminiContent(msg: ChatMessage) {
  return {
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  };
}

/**
 * Format history for plain-text display in system context.
 */
function formatHistory(history: ChatMessage[]): string {
  return history
    .map(
      (msg) => `${msg.role === "user" ? "Learner" : "Tutor"}: ${msg.content}`,
    )
    .join("\n");
}

const GEMINI_MODEL = "gemini-2.5-flash-lite";

export async function askBrainstorm({
  message,
  history,
  problemDescription,
  starterCode,
}: AskBrainstormParams): Promise<string> {
  const currentTurnContent = buildBrainstormUserMessage({ message });

  const contents = [
    ...history.map(mapToGeminiContent),
    {
      role: "user",
      parts: [{ text: currentTurnContent }],
    },
  ];

  const systemInstruction = buildBrainstormSystemPrompt({
    problemDescription,
    starterCode,
  });

  const response = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: { systemInstruction },
  });

  return (
    response.text ??
    "I'm having trouble responding right now. Please try again."
  );
}

export async function askHelp({
  code,
  error,
  hintLevel,
  history,
  brainstormHistory,
  problemDescription,
  referenceSolution,
  hints,
  starterCode,
  message,
}: AskHelpParams): Promise<string> {
  const brainstormPlan =
    brainstormHistory.length > 0
      ? `\n\n# Brainstorm Plan\n${formatHistory(brainstormHistory)}`
      : "";

  let systemInstruction = buildTutorSystemPrompt({
    problemDescription,
    referenceSolution,
    hints,
    hintLevel,
    starterCode,
  });

  if (brainstormPlan) {
    systemInstruction += brainstormPlan;
  }

  const currentTurnContent = buildTutorUserMessage({ message, code, error });

  const contents = [
    ...history.map(mapToGeminiContent),
    {
      role: "user",
      parts: [{ text: currentTurnContent }],
    },
  ];

  const response = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: { systemInstruction },
  });

  return (
    response.text ??
    "I'm having trouble generating help right now. Please try again."
  );
}

export async function askAssessment({
  code,
  error,
  hintLevel,
  history,
  brainstormHistory,
  problemDescription,
  referenceSolution,
  hints,
  starterCode,
  message,
  verificationResult,
}: AskAssessmentParams): Promise<string> {
  const brainstormPlan =
    brainstormHistory.length > 0
      ? `\n\n# Brainstorm Plan\n${formatHistory(brainstormHistory)}`
      : "";

  let systemInstruction = buildAssessmentSystemPrompt({
    problemDescription,
    referenceSolution,
    hints,
    hintLevel,
    is_correct: verificationResult.is_correct,
    reasoning: verificationResult.reasoning,
    mistakes: verificationResult.mistakes,
    starterCode,
  });

  if (brainstormPlan) {
    systemInstruction += brainstormPlan;
  }

  const currentTurnContent = buildTutorUserMessage({ message, code, error });

  const contents = [
    ...history.map(mapToGeminiContent),
    {
      role: "user",
      parts: [{ text: currentTurnContent }],
    },
  ];

  const response = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: { systemInstruction },
  });

  return (
    response.text ??
    "I'm having trouble generating the evaluation right now. Please try again."
  );
}

export async function verifySolution({
  code,
  problemDescription,
  referenceSolution,
  starterCode,
}: VerifySolutionInput): Promise<VerifySolutionOutput> {
  const prompt = buildVerifySolutionPrompt({
    code,
    problemDescription,
    referenceSolution,
    starterCode,
  });

  const response = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reasoning: { type: Type.STRING },
          is_correct: { type: Type.BOOLEAN },
          mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["reasoning", "is_correct", "mistakes"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    return {
      reasoning: "Failed to generate evaluation.",
      is_correct: false,
      mistakes: [],
    };
  }

  try {
    return JSON.parse(text) as VerifySolutionOutput;
  } catch {
    return {
      reasoning: "Failed to parse evaluation.",
      is_correct: false,
      mistakes: [],
    };
  }
}

export async function generateSolution({
  problemDescription,
  language,
  systemPrompt,
}: GenerateSolutionParams): Promise<string> {
  const userMessage = `
Problem: ${problemDescription}
Language: ${language}

Generate a clean, well-commented reference solution.`;

  const response = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return response.text ?? "Unable to generate solution.";
}
