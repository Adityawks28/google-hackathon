import { GoogleGenAI } from "@google/genai";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/prompts";
import type { ChatMessage } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

export async function askTutor(
  code: string,
  error: string,
  hintLevel: number,
  history: ChatMessage[],
  problemDescription: string
): Promise<string> {
  const conversationHistory = history
    .map((msg) => `${msg.role === "user" ? "Learner" : "Tutor"}: ${msg.content}`)
    .join("\n");

  const userMessage = `
Problem: ${problemDescription}

Learner's code:
\`\`\`
${code}
\`\`\`

${error ? `Error message: ${error}` : ""}

Current hint level: ${hintLevel} (1=gentle nudge, 2=more specific, 3=very specific)

${conversationHistory ? `Conversation so far:\n${conversationHistory}` : ""}

Please provide a level ${hintLevel} hint to guide the learner.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: userMessage,
    config: {
      systemInstruction: TUTOR_SYSTEM_PROMPT,
    },
  });

  return response.text ?? "I'm having trouble generating a hint right now. Please try again.";
}

export async function evaluateCode(
  code: string,
  problemDescription: string,
  testCases: { input: string; expectedOutput: string }[],
  systemPrompt: string
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

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  const text = response.text ?? '{"correct": false, "feedback": "Unable to evaluate. Please try again."}';

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
  systemPrompt: string
): Promise<string> {
  const userMessage = `
Problem: ${problemDescription}
Language: ${language}

Generate a clean, well-commented reference solution.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return response.text ?? "Unable to generate solution.";
}
