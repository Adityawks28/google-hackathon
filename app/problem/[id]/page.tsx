"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CodeEditor } from "@/components/CodeEditor";
import { ChatMessage } from "@/components/ChatMessage";
import { useTutor } from "@/hooks/useTutor";
import type { Problem, EvaluateResponse } from "@/types";
import Link from "next/link";

function ProblemContent() {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [brainstormInput, setBrainstormInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    phase,
    brainstormHistory,
    helpHistory,
    hintLevel,
    loading,
    sendBrainstormMessage,
    startCoding,
    requestHelp,
  } = useTutor(problemId);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const docSnap = await getDoc(doc(db, "problems", problemId));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Problem;
          setProblem(data);
          setCode(data.starterCode);
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
        setFetchError(true);
      } finally {
        setLoadingProblem(false);
      }
    }

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [brainstormHistory, helpHistory]);

  async function handleBrainstormSend() {
    if (!brainstormInput.trim() || loading) return;
    const message = brainstormInput;
    setBrainstormInput("");
    await sendBrainstormMessage(message);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId }),
      });
      const data: EvaluateResponse = await res.json();
      setCorrect(data.correct);
      setFeedback(data.feedback);

      if (user) {
        try {
          const progressRef = doc(db, "progress", `${user.uid}_${problemId}`);
          await runTransaction(db, async (transaction) => {
            const existing = await transaction.get(progressRef);
            const alreadySolved = existing.exists() && existing.data().solved;
            transaction.set(
              progressRef,
              {
                userId: user.uid,
                problemId,
                attempted: true,
                solved: alreadySolved || data.correct,
                lastAttemptAt: Date.now(),
              },
              { merge: true },
            );
          });
        } catch (progressError) {
          console.error("Error saving progress:", progressError);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      setFeedback("Failed to evaluate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGetHelp() {
    const guidance = await requestHelp(code, "");
    if (guidance && user) {
      try {
        const progressRef = doc(db, "progress", `${user.uid}_${problemId}`);
        await runTransaction(db, async (transaction) => {
          const existing = await transaction.get(progressRef);
          const currentHistory = existing.exists()
            ? (existing.data().hintHistory ?? [])
            : [];
          transaction.set(
            progressRef,
            {
              userId: user.uid,
              problemId,
              attempted: true,
              hintHistory: [...currentHistory, hintLevel + 1],
              lastAttemptAt: Date.now(),
            },
            { merge: true },
          );
        });
      } catch (hintError) {
        console.error("Error saving hint progress:", hintError);
      }
    }
  }

  if (loadingProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">
            Failed to load problem. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            {problem.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              phase === "brainstorm"
                ? "bg-purple-100 text-purple-700"
                : phase === "code"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
            }`}
          >
            {phase === "brainstorm"
              ? "Brainstorm"
              : phase === "code"
                ? "Coding"
                : `Help (Level ${hintLevel})`}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — always shows problem description */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white p-6">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-semibold">{problem.title}</h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {problem.description}
            </p>
            <h3 className="mt-4 text-sm font-semibold text-gray-500">
              Test Cases
            </h3>
            <ul className="space-y-1">
              {problem.testCases.map((tc, i) => (
                <li key={i} className="text-sm text-gray-600">
                  Input: <code>{tc.input}</code> &rarr; Expected:{" "}
                  <code>{tc.expectedOutput}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right panel — changes based on phase */}
        <div className="flex w-1/2 flex-col">
          {/* ===== PHASE 1: BRAINSTORM ===== */}
          {phase === "brainstorm" && (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                {/* Initial AI prompt */}
                {brainstormHistory.length === 0 && (
                  <div className="mb-4 rounded-lg bg-purple-50 p-4 text-sm text-purple-800">
                    <p className="font-medium">
                      Before we start coding, let&apos;s think through this
                      problem together.
                    </p>
                    <p className="mt-1">
                      How would you approach this? What steps come to mind?
                    </p>
                  </div>
                )}

                {/* Chat messages */}
                {brainstormHistory.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}

                {loading && (
                  <div className="mb-4">
                    <ChatMessage role="assistant" content="Thinking..." />
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Brainstorm input */}
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="flex gap-2">
                  <textarea
                    value={brainstormInput}
                    onChange={(e) => setBrainstormInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleBrainstormSend();
                      }
                    }}
                    placeholder="Describe your approach..."
                    rows={2}
                    className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleBrainstormSend}
                    disabled={loading || !brainstormInput.trim()}
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
                <button
                  onClick={startCoding}
                  className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Start Coding &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ===== PHASE 2 & 3: CODE + HELP ===== */}
          {(phase === "code" || phase === "help") && (
            <div className="flex flex-1 flex-col">
              <div className="flex-1">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={problem.language}
                />
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`border-t px-4 py-3 ${
                    correct
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {correct ? (
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-green-500 text-lg text-white">
                        &#10003;
                      </span>
                      <div>
                        <p className="text-base font-bold">Solved!</p>
                        <p className="text-sm">{feedback}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <span className="font-medium">Not quite.</span> {feedback}
                    </div>
                  )}
                </div>
              )}

              {/* Help panel — shows AI help messages */}
              {phase === "help" && helpHistory.length > 0 && (
                <div className="max-h-48 overflow-y-auto border-t border-orange-200 bg-orange-50 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-orange-600">
                    AI Help (Level {hintLevel})
                  </p>
                  {helpHistory.map((msg, i) => (
                    <div
                      key={i}
                      className="mb-2 whitespace-pre-wrap text-sm text-gray-800"
                    >
                      {msg.content}
                    </div>
                  ))}
                  {loading && (
                    <p className="text-sm italic text-orange-500">
                      Thinking...
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "Evaluating..." : "Submit"}
                </button>
                <button
                  onClick={handleGetHelp}
                  disabled={loading || hintLevel >= 3}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading
                    ? "Loading..."
                    : hintLevel >= 3
                      ? "Max help reached"
                      : hintLevel === 0
                        ? "Get Help"
                        : hintLevel === 1
                          ? "More Help"
                          : "I Give Up — Teach Me"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProblemPage() {
  return (
    <ProtectedRoute>
      <ProblemContent />
    </ProtectedRoute>
  );
}
