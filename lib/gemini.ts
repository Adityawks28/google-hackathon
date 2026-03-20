import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "@/types";

let _ai: GoogleGenAI | undefined;
function getAI(): GoogleGenAI {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });
  }
  return _ai;
}

function formatHistory(history: ChatMessage[]): string {
  return history
    .map(
      (msg) => `${msg.role === "user" ? "Learner" : "Tutor"}: ${msg.content}`,
    )
    .join("\n");
}

export async function askBrainstorm(
  message: string,
  history: ChatMessage[],
  problemDescription: string,
  systemPrompt: string,
): Promise<string> {
  const conversationHistory = formatHistory(history);

  const userMessage = `
Problem: ${problemDescription}

${conversationHistory ? `Conversation so far:\n${conversationHistory}\n` : ""}
Learner: ${message}

Respond as the tutor. Help them think through the approach — no code.`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: userMessage,
    config: { systemInstruction: systemPrompt },
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
  systemPrompt: string,
): Promise<string> {
  const brainstormContext = formatHistory(brainstormHistory);
  const helpConversation = formatHistory(history);

  const userMessage = `
Problem: ${problemDescription}

Brainstorm conversation (what the learner planned):
${brainstormContext || "(No brainstorm conversation)"}

Learner's current code:
\`\`\`
${code}
\`\`\`

${error ? `Error message: ${error}` : ""}

Current help level: ${hintLevel} (1=hint, 2=more specific, 3=teach/give up)

${helpConversation ? `Help conversation so far:\n${helpConversation}` : ""}

Provide level ${hintLevel} help based on their specific code and mistakes.`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.0-flash",
    contents: userMessage,
    config: { systemInstruction: systemPrompt },
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
    model: "gemini-2.0-flash",
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
    model: "gemini-2.0-flash",
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return response.text ?? "Unable to generate solution.";
}
