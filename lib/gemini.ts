import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "@/types";
import {
  buildTutorSystemPrompt,
  buildTutorUserMessage,
  buildBrainstormSystemPrompt,
  buildBrainstormUserMessage,
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

export async function askBrainstorm(
  message: string,
  history: ChatMessage[],
  problemDescription: string,
): Promise<string> {
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

export async function askHelp(
  code: string,
  error: string,
  hintLevel: number,
  history: ChatMessage[],
  brainstormHistory: ChatMessage[],
  problemDescription: string,
  referenceSolution: string | null,
  hints: string[] | null,
  message?: string,
): Promise<string> {
  const brainstormPlan =
    brainstormHistory.length > 0
      ? `\n\n# Brainstorm Plan\n${formatHistory(brainstormHistory)}`
      : "";

  let systemInstruction = buildTutorSystemPrompt({
    problemDescription,
    referenceSolution,
    hints,
    hintLevel,
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

export async function evaluateCode(
  code: string,
  problemDescription: string,
  testCases: { input: string; expectedOutput: string }[],
  systemPrompt: string,
): Promise<{ correct: boolean; feedback: string }> {
  const userMessage = `
Problem: ${problemDescription}

Test Cases:
${testCases.map((tc, i) => `${i + 1}. Input: ${tc.input} → Expected: ${tc.expectedOutput}`).join("\n")}

User's Solution:
\`\`\`
${code}
\`\`\`

Evaluate this solution and respond with a JSON object containing "correct" (boolean) and "feedback" (string).`;

  const response = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  const text =
    response.text ??
    '{"correct": false, "feedback": "Unable to evaluate. Please try again."}';

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { correct: false, feedback: text };
  }
}

export async function generateSolution(
  problemDescription: string,
  language: string,
  systemPrompt: string,
): Promise<string> {
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
