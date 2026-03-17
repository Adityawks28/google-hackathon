"use client";

import { useState, useCallback } from "react";
import type { ChatMessage, TutorRequest, TutorResponse } from "@/types";

export function useTutor(problemId: string) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [loading, setLoading] = useState(false);

  const sendCode = useCallback(
    async (code: string, error: string) => {
      setLoading(true);
      try {
        const userMessage: ChatMessage = {
          role: "user",
          content: error
            ? `Here's my code:\n\`\`\`\n${code}\n\`\`\`\n\nI'm getting this error: ${error}`
            : `Here's my code:\n\`\`\`\n${code}\n\`\`\`\n\nCan you help me?`,
          timestamp: Date.now(),
        };

        const updatedHistory = [...history, userMessage];

        const body: TutorRequest = {
          code,
          error,
          hintLevel: hintLevel || 1,
          history: updatedHistory,
          problemId,
        };

        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error("Failed to get tutor response");
        }

        const data: TutorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.guidance,
          timestamp: Date.now(),
        };

        setHistory([...updatedHistory, assistantMessage]);
        return data.guidance;
      } catch (error) {
        console.error("Tutor error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [history, hintLevel, problemId],
  );

  const requestHint = useCallback(async () => {
    const nextLevel = Math.min(hintLevel + 1, 3);
    setHintLevel(nextLevel);
    return nextLevel;
  }, [hintLevel]);

  const resetConversation = useCallback(() => {
    setHistory([]);
    setHintLevel(0);
  }, []);

  return {
    history,
    hintLevel,
    loading,
    sendCode,
    requestHint,
    resetConversation,
  };
}
