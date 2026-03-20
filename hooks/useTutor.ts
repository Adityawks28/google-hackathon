"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  ChatMessage,
  TutorPhase,
  TutorResponse,
  UserSession,
} from "@/types";
import { sessionModel } from "@/lib/db";

export interface UseTutorReturn {
  phase: TutorPhase;
  brainstormHistory: ChatMessage[];
  helpHistory: ChatMessage[];
  hintLevel: number;
  loading: boolean;
  isLoaded: boolean;
  sessions: UserSession[];
  currentSessionId: string | null;
  sendBrainstormMessage: (message: string) => Promise<string | null>;
  startCoding: () => Promise<void>;
  requestHelp: (code: string, error: string) => Promise<string | null>;
  sendHelpMessage: (message: string, code: string) => Promise<string | null>;
  resetConversation: () => Promise<void>;
  createNewSession: () => Promise<UserSession | null>;
  switchSession: (sessionId: string) => void;
  updateSessionCode: (code: string, language: string) => Promise<void>;
}

export function useTutor(problemId: string, userId?: string): UseTutorReturn {
  const [phase, setPhase] = useState<TutorPhase>("brainstorm");
  const [brainstormHistory, setBrainstormHistory] = useState<ChatMessage[]>([]);
  const [helpHistory, setHelpHistory] = useState<ChatMessage[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!userId || !problemId) return;
    try {
      const userSessions = await sessionModel.listByUserIdAndProblemId(
        userId,
        problemId,
      );
      setSessions(userSessions);

      if (userSessions.length > 0) {
        // Select the most recent session if none selected
        if (!currentSessionId) {
          setCurrentSessionId(userSessions[0].id!);
        }
      } else {
        // Create first session
        const newSession = await sessionModel.create(userId, problemId);
        setSessions([newSession]);
        setCurrentSessionId(newSession.id!);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [userId, problemId, currentSessionId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    async function loadCurrentSession() {
      if (!currentSessionId) return;
      try {
        const session = await sessionModel.getById(currentSessionId);
        if (session) {
          setBrainstormHistory(session.brainstormMessages || []);
          setHelpHistory(session.helpMessages || []);
          if (session.hintLevel != null) {
            setHintLevel(session.hintLevel);
          }
          if (session.phase) {
            setPhase(session.phase);
          }
          // Reset hint level based on help messages length?
          // Or we could store it in UserSession too.
          setHintLevel(Math.min(session.helpMessages?.length || 0, 3));
        }
      } catch (error) {
        console.error("Error loading session:", error);
      }
    }

    loadCurrentSession();
  }, [currentSessionId]);

  const createNewSession =
    useCallback(async (): Promise<UserSession | null> => {
      if (!userId || !problemId) return null;
      try {
        const newSession = await sessionModel.create(userId, problemId);
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id!);
        return newSession;
      } catch (error) {
        console.error("Error creating new session:", error);
        return null;
      }
    }, [userId, problemId]);

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const sendBrainstormMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!currentSessionId) return null;
      setLoading(true);
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: Date.now(),
        code: null,
        error: null,
        hintLevel: null,
      };

      setBrainstormHistory((prev) => [...prev, userMessage]);

      try {
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
            sessionId: currentSessionId,
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
    [brainstormHistory, problemId, userId, currentSessionId],
  );

  const startCoding = useCallback(async (): Promise<void> => {
    setPhase("code");
    if (currentSessionId) {
      await sessionModel.setPhase(currentSessionId, "code");
    }
  }, [currentSessionId]);

  const requestHelp = useCallback(
    async (
      code: string,
      error: string,
      message?: string,
    ): Promise<string | null> => {
      if (!currentSessionId) return null;
      const nextLevel = Math.min(hintLevel + 1, 3);
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

      if (currentSessionId) {
        await sessionModel.setPhase(currentSessionId, "help");
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
            sessionId: currentSessionId,
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
        setHintLevel(nextLevel);
        if (userId && problemId) {
          await sessionModel.upsert(userId, problemId, { hintLevel: nextLevel });
        }
        return data.guidance;
      } catch (error) {
        console.error("Help error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      hintLevel,
      helpHistory,
      brainstormHistory,
      problemId,
      userId,
      currentSessionId,
    ],
  );

  const sendHelpMessage = useCallback(
    async (message: string, code: string): Promise<string | null> => {
      if (!currentSessionId) return null;
      setLoading(true);
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: Date.now(),
        code,
        error: null,
        hintLevel,
      };

      setHelpHistory((prev) => [...prev, userMessage]);

      try {
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
            sessionId: currentSessionId,
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
    [
      helpHistory,
      hintLevel,
      brainstormHistory,
      problemId,
      userId,
      currentSessionId,
    ],
  );

  const updateSessionCode = useCallback(
    async (code: string, language: string): Promise<void> => {
      if (currentSessionId) {
        await sessionModel.upsert(currentSessionId, { code, language });
      }
    },
    [currentSessionId],
  );

  const resetConversation = useCallback(async (): Promise<void> => {
    setPhase("brainstorm");
    setBrainstormHistory([]);
    setHelpHistory([]);
    setHintLevel(0);
    if (currentSessionId) {
      await sessionModel.upsert(currentSessionId, {
        phase: "brainstorm",
        brainstormMessages: [],
        helpMessages: [],
        hintLevel: 0,
      });
    }
  }, [currentSessionId]);

  return {
    phase,
    brainstormHistory,
    helpHistory,
    hintLevel,
    loading,
    isLoaded,
    sessions,
    currentSessionId,
    sendBrainstormMessage,
    startCoding,
    requestHelp,
    sendHelpMessage,
    resetConversation,
    createNewSession,
    switchSession,
    updateSessionCode,
  };
}
