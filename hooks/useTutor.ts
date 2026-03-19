"use client";

import { useState, useCallback } from "react";
import type { ChatMessage, TutorPhase, TutorResponse } from "@/types";

export function useTutor(problemId: string) {
  const [phase, setPhase] = useState<TutorPhase>("brainstorm");
  const [brainstormHistory, setBrainstormHistory] = useState<ChatMessage[]>([]);
  const [helpHistory, setHelpHistory] = useState<ChatMessage[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [loading, setLoading] = useState(false);

  const sendBrainstormMessage = useCallback(
    async (message: string) => {
      setLoading(true);
      try {
        const userMessage: ChatMessage = {
          role: "user",
          content: message,
          timestamp: Date.now(),
        };

        const updatedHistory = [...brainstormHistory, userMessage];

        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: message,
            error: "",
            hintLevel: 0,
            history: updatedHistory,
            problemId,
            mode: "brainstorm",
          }),
        });

        if (!res.ok) throw new Error("Failed to get tutor response");

        const data: TutorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.guidance,
          timestamp: Date.now(),
        };

        setBrainstormHistory([...updatedHistory, assistantMessage]);
        return data.guidance;
      } catch (error) {
        console.error("Brainstorm error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [brainstormHistory, problemId],
  );

  const startCoding = useCallback(() => {
    setPhase("code");
  }, []);

  const requestHelp = useCallback(
    async (code: string, error: string) => {
      const nextLevel = Math.min(hintLevel + 1, 3);
      setHintLevel(nextLevel);
      setPhase("help");
      setLoading(true);

      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            error,
            hintLevel: nextLevel,
            history: helpHistory,
            problemId,
            mode: "help",
            brainstormHistory,
          }),
        });

        if (!res.ok) throw new Error("Failed to get help response");

        const data: TutorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.guidance,
          timestamp: Date.now(),
        };

        setHelpHistory((prev) => [...prev, assistantMessage]);
        return data.guidance;
      } catch (error) {
        console.error("Help error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [hintLevel, helpHistory, brainstormHistory, problemId],
  );

  const sendHelpMessage = useCallback(
    async (message: string, code: string) => {
      setLoading(true);
      try {
        const userMessage: ChatMessage = {
          role: "user",
          content: message,
          timestamp: Date.now(),
        };

        let updatedHistory: ChatMessage[] = [];
        setHelpHistory((prev) => {
          updatedHistory = [...prev, userMessage];
          return updatedHistory;
        });

        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            error: "",
            hintLevel,
            history: updatedHistory,
            problemId,
            mode: "help",
            brainstormHistory,
          }),
        });

        if (!res.ok) throw new Error("Failed to get help response");

        const data: TutorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.guidance,
          timestamp: Date.now(),
        };

        setHelpHistory((prev) => [...prev, assistantMessage]);
        return data.guidance;
      } catch (error) {
        console.error("Help chat error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [hintLevel, brainstormHistory, problemId],
  );

  const resetConversation = useCallback(() => {
    setPhase("brainstorm");
    setBrainstormHistory([]);
    setHelpHistory([]);
    setHintLevel(0);
  }, []);

  return {
    phase,
    brainstormHistory,
    helpHistory,
    hintLevel,
    loading,
    sendBrainstormMessage,
    startCoding,
    requestHelp,
    sendHelpMessage,
    resetConversation,
  };
}
