"use client";

import { useState, useCallback, useEffect } from "react";
import type { ChatMessage, TutorPhase, TutorResponse } from "@/types";
import { sessionModel } from "@/lib/db";

export function useTutor(problemId: string, userId?: string) {
  const [phase, setPhase] = useState<TutorPhase>("brainstorm");
  const [brainstormHistory, setBrainstormHistory] = useState<ChatMessage[]>([]);
  const [helpHistory, setHelpHistory] = useState<ChatMessage[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!userId || !problemId) return;
      try {
        const session = await sessionModel.getById(userId, problemId);
        if (session) {
          setBrainstormHistory(session.brainstormMessages || []);
          setHelpHistory(session.helpMessages || []);
          if (session.phase) {
            setPhase(session.phase);
          } else {
            // Fallback for legacy sessions
            if (session.helpMessages?.length > 0) {
              setPhase("help");
            } else if (session.brainstormMessages?.length > 0) {
              setPhase("brainstorm");
            }
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadSession();
  }, [userId, problemId]);

  const sendBrainstormMessage = useCallback(
    async (message: string) => {
      setLoading(true);
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };

      setBrainstormHistory((prev) => [...prev, userMessage]);

      try {
        const userMessage: ChatMessage = {
          role: "user",
          content: message,
          timestamp: Date.now(),
          code: null,
          error: null,
          hintLevel: null,
        };

        setBrainstormHistory((prev) => [...prev, userMessage]);

        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: message,
            error: "",
            hintLevel: 0,
            message,
            history: brainstormHistory,
            problemId,
            mode: "brainstorm",
            userId,
          }),
        });

        if (!res.ok) throw new Error("Failed to get tutor response");

        const data: TutorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.guidance,
          timestamp: Date.now(),
          code: null,
          error: null,
          hintLevel: null,
        };

        setBrainstormHistory((prev) => [...prev, assistantMessage]);
        return data.guidance;
      } catch (error) {
        console.error("Brainstorm error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [brainstormHistory, problemId, userId],
  );

  const startCoding = useCallback(async () => {
    setPhase("code");
    if (userId && problemId) {
      await sessionModel.setPhase(userId, problemId, "code");
    }
  }, [userId, problemId]);

  const requestHelp = useCallback(
    async (code: string, error: string, message?: string) => {
      const nextLevel = Math.min(hintLevel + 1, 3);
      setHintLevel(nextLevel);
      setPhase("help");
      setLoading(true);

      const userMessageText = message || "I need help with my code.";
      const userMessage: ChatMessage = {
        role: "user",
        content: userMessageText,
        timestamp: Date.now(),
        code,
        error: error || null,
        hintLevel: nextLevel,
      };
      setHelpHistory((prev) => [...prev, userMessage]);

      if (userId && problemId) {
        await sessionModel.setPhase(userId, problemId, "help");
      }

      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            error,
            hintLevel: nextLevel,
            message: userMessageText,
            history: helpHistory,
            problemId,
            mode: "help",
            brainstormHistory,
            userId,
          }),
        });

        if (!res.ok) throw new Error("Failed to get help response");

        const data: TutorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.guidance,
          timestamp: Date.now(),
          code: null,
          error: null,
          hintLevel: null,
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
    [hintLevel, helpHistory, brainstormHistory, problemId, userId],
  );

  const sendHelpMessage = useCallback(
    async (message: string, code: string) => {
      setLoading(true);
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };

      setHelpHistory((prev) => [...prev, userMessage]);

      try {
        const userMessage: ChatMessage = {
          role: "user",
          content: message,
          timestamp: Date.now(),
          code,
          error: null,
          hintLevel,
        };

        setHelpHistory((prev) => [...prev, userMessage]);

        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            error: "",
            hintLevel,
            message,
            history: helpHistory, // Previous history
            problemId,
            mode: "help",
            brainstormHistory,
            userId,
          }),
        });

        if (!res.ok) throw new Error("Failed to get help response");

        const data: TutorResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.guidance,
          timestamp: Date.now(),
          code: null,
          error: null,
          hintLevel: null,
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
    [helpHistory, hintLevel, brainstormHistory, problemId, userId],
  );

  const resetConversation = useCallback(async () => {
    setPhase("brainstorm");
    setBrainstormHistory([]);
    setHelpHistory([]);
    setHintLevel(0);
    if (userId && problemId) {
      await sessionModel.upsert(userId, problemId, {
        phase: "brainstorm",
        brainstormMessages: [],
        helpMessages: [],
      });
    }
  }, [userId, problemId]);

  return {
    phase,
    brainstormHistory,
    helpHistory,
    hintLevel,
    loading,
    isLoaded,
    sendBrainstormMessage,
    startCoding,
    requestHelp,
    sendHelpMessage,
    resetConversation,
  };
}
